import { NextFunction, Request, Response } from 'express';
const multer = require('multer');
const fs = require('fs');

// Setup Folder
const setUpFolder = (info: any) => {
    let folderName = `uploads/${info._id}`;
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
        callback(null, `uploads/${req.user._id}`);
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
    try {
        setUpFolder(req.user);
        upload(req, res, async function (err: any) {
            if (err) {
                res.status(400).json({ message: err.message })
            } else {
                let path = `/uploads/${req.user._id}/${req.file.originalname}`
                res.status(200).json({ message: 'Image Uploaded Successfully !', path: path })
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
                console.log(data)
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

const getAllImages = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let { path } = req.body;
        fs.readdir('./' + path, async (err: any, files: any) => {
            if(files.length > 0){
                let images: any[] = [];
                let promise = new Promise<void>((resolve, reject) => {
                    files.forEach(async (file: any, index: number, array: string | any[]) => {
                        let path_image = path + "/" + file;
                        let type = file.split('-')[0]
                        let data = fs.readFileSync('./' + path_image);
                        let image = data.toString('base64');
                        images.push({
                            type: type,
                            image: image
                        })
                        // Check done and resolve.
                        if (index === array.length - 1) resolve();
                    });
                });

                promise.then(() => {
                    console.log('All done!');
                    return res.status(200).json({
                        success: true,
                        message: 'Get images successful',
                        images: images
                    })
                });
            } else{
                return res.status(404).json({
                    success: false,
                    message: 'Not found images!'
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
    getAllImages,
    deleteImage 
};
