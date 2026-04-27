import express from 'express';
import { body, param } from 'express-validator';
import multer from 'multer';
import { authMiddleware } from '../middleware/auth.js';
import File from '../models/File.js';
import Folder from '../models/Folder.js';
import sharp from 'sharp';
import { v4 as uuid } from 'uuid';
import path from 'path';

const router = express.Router();

router.use(authMiddleware);

// Configure multer
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/pdf',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  },
});

// Upload file
router.post(
  '/upload',
  upload.single('file'),
  async (req, res) => {
    try {
      const { workspace, project, folder } = req.body;

      if (!workspace) {
        return res.status(400).json({ message: 'Workspace is required' });
      }

      // Generate unique filename
      const fileId = uuid();
      const ext = path.extname(req.file.originalname);
      const filename = `${fileId}${ext}`;

      // TODO: Upload to S3/Cloudinary
      // For now, save locally
      const url = `/uploads/${filename}`;

      // Handle image optimization
      let thumbnailUrl = null;
      if (req.file.mimetype.startsWith('image/')) {
        try {
          // Create thumbnail
          const thumbnail = await sharp(req.file.buffer)
            .resize(200, 200, { fit: 'cover' })
            .toBuffer();
          // TODO: Save thumbnail to storage
          thumbnailUrl = `/uploads/thumbnails/${fileId}-thumb.jpg`;
        } catch (error) {
          console.error('Thumbnail creation failed:', error);
        }
      }

      // Create file record
      const file = new File({
        workspace,
        project,
        folder,
        uploadedBy: req.userId,
        filename,
        originalName: req.file.originalname,
        fileType: req.file.mimetype.split('/')[0],
        size: req.file.size,
        mimeType: req.file.mimetype,
        url,
        thumbnailUrl,
      });

      await file.save();

      // Add to folder if specified
      if (folder) {
        await Folder.findByIdAndUpdate(folder, {
          $push: { files: file._id },
        });
      }

      res.status(201).json(file);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Get workspace files
router.get('/workspace/:workspaceId', async (req, res) => {
  try {
    const files = await File.find({
      workspace: req.params.workspaceId,
      isArchived: false,
    })
      .populate('uploadedBy')
      .sort({ createdAt: -1 });

    res.json(files);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get file
router.get('/:fileId', async (req, res) => {
  try {
    const file = await File.findById(req.params.fileId).populate('uploadedBy');

    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    res.json(file);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update file
router.put('/:fileId', async (req, res) => {
  try {
    const file = await File.findByIdAndUpdate(
      req.params.fileId,
      req.body,
      { new: true }
    );

    res.json(file);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete file (soft delete)
router.delete('/:fileId', async (req, res) => {
  try {
    const file = await File.findByIdAndUpdate(
      req.params.fileId,
      { isArchived: true },
      { new: true }
    );

    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create folder
router.post(
  '/folders',
  [
    body('name').notEmpty().trim(),
    body('workspace').notEmpty(),
  ],
  async (req, res) => {
    try {
      const folder = new Folder({
        name: req.body.name,
        workspace: req.body.workspace,
        parentFolder: req.body.parentFolder,
        createdBy: req.userId,
      });

      await folder.save();

      if (req.body.parentFolder) {
        await Folder.findByIdAndUpdate(req.body.parentFolder, {
          $push: { subFolders: folder._id },
        });
      }

      res.status(201).json(folder);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  }
);

// Get folder contents
router.get('/folders/:folderId/contents', async (req, res) => {
  try {
    const folder = await Folder.findById(req.params.folderId)
      .populate('files')
      .populate('subFolders');

    if (!folder) {
      return res.status(404).json({ message: 'Folder not found' });
    }

    res.json(folder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;