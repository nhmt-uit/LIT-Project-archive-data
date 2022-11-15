import { NextFunction, Request, Response } from 'express';
const multer = require('multer');
const fs = require('fs');

// Setup Folder
const setUpFolder = (folderName: any) => {
    try {
        if (!fs.existsSync(folderName)) {
            fs.mkdirSync(folderName)
        }
    } catch (err) {
        console.error(err)
    }
};

// Setup Storage
const storage = multer.diskStorage({
    destination: function (req: any, file: any, callback: (arg0: null, arg1: string) => void) {
        // Set the destination where the files should be stored on disk
        callback(null, `uploads/companies`);
    },
    filename: function (req: any, file: { originalname: string; }, callback: (arg0: null, arg1: string) => void) {
        // Set the file name on the file in the uploads folder
        callback(null, file.originalname);
    },
    fileFilter: function (req: any, file: { mimetype: string; }, callback: (arg0: Error | null, arg1: boolean) => void) {
        // Check type file
        if (file.mimetype !== 'image/jpeg' && file.mimetype !== 'image/png') {
            return callback(new Error('Only Images are allowed !'), false)
        }
        callback(null, true);
    }
});

const upload = multer({ storage: storage }).single('image');

const saveImage = (req: any, res: Response, next: NextFunction) => {
    setUpFolder(`uploads/companies`)
    try {
        upload(req, res, async function (err: any) {
            if (err) {
                res.status(400).json({ message: err.message })
            } else {
                let path = `/uploads/companies/${req.file.originalname}`
                res.status(200).json({ message: 'Image Uploaded Successfully !', path: path})
            }
        })
    } catch (err) {
        console.log(err)
    }
};

const getImage = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let { path } = req.body;
        fs.readFile('./' + path, (err: any, data: any) => {
            if(data){
                // Convert buffer to base64
                let image = data.toString('base64');
                return res.status(200).json({
                    success: true,
                    message: 'Get image successful',
                    image
                })
            } else{
                return res.status(404).json({
                    success: false,
                    message: 'Not found image!'
                })
            }
        })
    } catch (err) {
        res.status(400).json({
            success: false,
            err
        })
    }
};

const deleteImage = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let { path } = req.body;
        if(path !== '') {
            fs.unlinkSync(`./${path}`);
        }
        return res.status(200).json({
                    success: true,
                    message: 'Delete image successful!'
                })
        
    } catch (err) {
        res.status(400).json({
            success: false,
            err
        })
    }
};

export default { 
    saveImage, 
    getImage,
    deleteImage
};
