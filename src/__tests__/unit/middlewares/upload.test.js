import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

const mockDiskStorageFn = vi.fn();
const mockMulterFn = vi.fn();

vi.mock('multer', () => {
  const multer = (options) => {
    mockMulterFn(options);
    return {
      single: vi.fn((fieldName) => (req, res, next) => next()),
      array: vi.fn((fieldName, maxCount) => (req, res, next) => next()),
      fields: vi.fn((fields) => (req, res, next) => next()),
    };
  };
  multer.diskStorage = (options) => {
    mockDiskStorageFn(options);
    return options;
  };
  return { default: multer };
});

const mockCreateHttpError = vi.fn();
vi.mock('http-errors', () => ({
  default: (...args) => {
    mockCreateHttpError(...args);
    // Return a standard error object similar to what http-errors would create
    const err = new Error(args[1] || 'Http Error');
    err.status = args[0];
    return err;
  },
}));

vi.mock('../../../constants/index.js', () => ({
  TEMP_UPLOADS_DIR: 'mocked_temp_uploads_dir_from_constants',
}));

describe('Upload Middleware', () => {
  let upload; // To hold the imported module
  let capturedMulterOptions; // To store options passed to multer()
  let capturedDiskStorageOptions; // To store options passed to multer.diskStorage()

  // Fixed values for predictable filename generation
  const MOCK_DATE_NOW = 1678886400000; // Example: 2023-03-15T12:00:00.000Z
  const MOCK_MATH_RANDOM = 0.123456789; // Example random value

  beforeEach(async () => {
    // Reset modules to ensure upload.js is re-evaluated with fresh mocks for each test.
    // This is crucial because upload.js executes multer() at the top level upon import.
    vi.resetModules();
    // Clear any previous mock call history and implementations
    vi.clearAllMocks();

    // Spy on Date.now and Math.random BEFORE the module is imported
    // so that when upload.js runs, it uses these mocked versions.
    vi.spyOn(Date, 'now').mockReturnValue(MOCK_DATE_NOW);
    vi.spyOn(Math, 'random').mockReturnValue(MOCK_MATH_RANDOM);

    // Dynamically import the module to be tested.
    upload = await import('../../../middlewares/upload.js');

    // Retrieve the options captured by our mocks.
    // multer() is called once when upload.js is loaded.
    if (mockMulterFn.mock.calls.length > 0) {
      capturedMulterOptions = mockMulterFn.mock.calls[0][0];
    }
    // multer.diskStorage() is called once.
    if (mockDiskStorageFn.mock.calls.length > 0) {
      capturedDiskStorageOptions = mockDiskStorageFn.mock.calls[0][0];
    }
  });

  afterEach(() => {
    // Restore all spied functions to their original implementations
    vi.restoreAllMocks();
  });

  it('should export an upload object', () => {
    expect(upload.upload).toBeDefined();
  });

  describe('Multer Main Configuration', () => {
    it('should call multer() with storage, limits, and fileFilter options', () => {
      expect(mockMulterFn).toHaveBeenCalledTimes(1);
      expect(capturedMulterOptions).toBeDefined();
      expect(capturedMulterOptions.storage).toBeDefined();
      expect(capturedMulterOptions.limits).toBeDefined();
      expect(capturedMulterOptions.fileFilter).toBeInstanceOf(Function);
    });

    it('should configure multer with the correct file size limits', () => {
      const expectedLimits = {
        fieldSize: 1024 * 1024 * 5, // 5MB
      };
      expect(capturedMulterOptions.limits).toEqual(expectedLimits);
    });
  });

  describe('Storage Configuration (via multer.diskStorage)', () => {
    it('should call multer.diskStorage() with destination and filename options', () => {
      expect(mockDiskStorageFn).toHaveBeenCalledTimes(1);
      expect(capturedDiskStorageOptions).toBeDefined();
      expect(capturedDiskStorageOptions.destination).toBe(
        'mocked_temp_uploads_dir_from_constants',
      );
      expect(capturedDiskStorageOptions.filename).toBeInstanceOf(Function);
    });

    it('should set the correct destination directory using TEMP_UPLOADS_DIR from constants', () => {
      expect(capturedDiskStorageOptions.destination).toBe(
        'mocked_temp_uploads_dir_from_constants',
      );
    });

    it('should generate a unique filename with a prefix and the original filename', () => {
      const mockReq = {};
      const mockFile = { originalname: 'testImage.png' };
      const callback = vi.fn();

      capturedDiskStorageOptions.filename(mockReq, mockFile, callback);

      const expectedPrefix = `${MOCK_DATE_NOW}_${Math.round(
        MOCK_MATH_RANDOM * 1e9,
      )}`;
      const expectedFileName = `${expectedPrefix}_${mockFile.originalname}`;

      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenCalledWith(null, expectedFileName);
      expect(Date.now).toHaveBeenCalledTimes(1);
      expect(Math.random).toHaveBeenCalledTimes(1);
    });
  });

  describe('File Filter Logic', () => {
    let fileFilterFunction;
    const mockRequest = {};
    let mockCallback;

    beforeEach(() => {
      fileFilterFunction = capturedMulterOptions.fileFilter;
      mockCallback = vi.fn();
    });
    ['png', 'jpg', 'jpeg'].forEach((ext) => {
      it(`should allow .${ext} files`, () => {
        const mockFile = { originalname: `myImage.${ext}` };
        fileFilterFunction(mockRequest, mockFile, mockCallback);
        expect(mockCallback).toHaveBeenCalledWith(null, true);
        expect(mockCreateHttpError).not.toHaveBeenCalled();
      });

      it(`should allow uppercase .${ext.toUpperCase()} files (due to .toLowerCase())`, () => {
        const mockFile = { originalname: `myImage.${ext.toUpperCase()}` };
        fileFilterFunction(mockRequest, mockFile, mockCallback);
        expect(mockCallback).toHaveBeenCalledWith(null, true);
        expect(mockCreateHttpError).not.toHaveBeenCalled();
      });
    });

    it('should reject .exe files and call createHttpError with 400 status', () => {
      const mockFile = { originalname: 'maliciousProgram.exe' };
      fileFilterFunction(mockRequest, mockFile, mockCallback);

      expect(mockCreateHttpError).toHaveBeenCalledTimes(1);
      expect(mockCreateHttpError).toHaveBeenCalledWith(
        400,
        'A file with the extension .exe cannot be saved.',
      );

      expect(mockCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'A file with the extension .exe cannot be saved.',
          status: 400,
        }),
      );
    });
    it('should reject files without extension and call createHttpError with 400 status', () => {
      const mockFile = { originalname: 'nakedFile' };
      fileFilterFunction(mockRequest, mockFile, mockCallback);

      expect(mockCreateHttpError).toHaveBeenCalledTimes(1);
      expect(mockCreateHttpError).toHaveBeenCalledWith(
        400,
        'A file without extension cannot be saved.',
      );

      expect(mockCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'A file without extension cannot be saved.',
          status: 400,
        }),
      );
    });

    ['txt', 'pdf', 'gif', 'doc', 'gz', 'tmp'].forEach((ext) => {
      it(`should reject .${ext} files and call createHttpError with 400 status and dynamic message`, () => {
        const mockFile = { originalname: `document.${ext}` };
        fileFilterFunction(mockRequest, mockFile, mockCallback);

        const expectedErrorMessage = `A file with the ${ext} extension cannot be saved.`;
        expect(mockCreateHttpError).toHaveBeenCalledTimes(1);
        expect(mockCreateHttpError).toHaveBeenCalledWith(
          400,
          expectedErrorMessage,
        );
        expect(mockCallback).toHaveBeenCalledWith(
          expect.objectContaining({
            message: expectedErrorMessage,
            status: 400,
          }),
        );
        mockCreateHttpError.mockClear();
        mockCallback.mockClear();
      });
    });
  });
});
