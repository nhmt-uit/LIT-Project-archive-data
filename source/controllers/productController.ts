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
        callback(null, `uploads/products`);
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

const upload = multer({ storage: storage }).fields([{ name: 'image_0' }, { name: 'image_1' }, { name: 'image_2' }, { name: 'image_3' }, { name: 'image_4' }]);

const saveImage = (req: any, res: Response, next: NextFunction) => {
    setUpFolder(`uploads/products`)
    try {
        upload(req, res, async function (err: any) {
            if (err) {
                res.status(400).json({ message: err.message })
            } else {
                let images = {
                    image_0 : req.files.image_0 && req.files.image_0[0].path || '',
                    image_1 : req.files.image_1 && req.files.image_1[0].path || '',
                    image_2 : req.files.image_2 && req.files.image_2[0].path || '',
                    image_3 : req.files.image_3 && req.files.image_3[0].path || '',
                    image_4 : req.files.image_4 && req.files.image_4[0].path || '',
                }
                
                res.status(200).json({ message: 'Image Uploaded Successfully !', images})
            }
        })
    } catch (err) {
        console.log(err)
    }
};

const getImage = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let { paths } = req.body;
        let responseData: any = {};
        Object.keys(paths).forEach((key) => {
            let path = paths[key];
            let data = fs.readFileSync('./' + path);
            let image = data.toString('base64');
            responseData[key] = image;
        });
        return res.status(200).json({
                    success: true,
                    message: 'Get image successful',
                    images: responseData
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
        let { paths } = req.body;
        console.log(paths)
        Object.keys(paths).forEach((key) => {
            let path = paths[key];
            fs.unlinkSync(`./${path}`);
        });
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
