const fs = require('fs');
const express = require('express'); // Import express module
const router = express.Router(); // Create an instance of the router
const path = require('path'); // Import path module
const Auth = require('../middleware/auth.middleware');

const upload = require('../middleware/multer.middleware');
const uploadModel = require('../model/uploads.model');



// Create a Bucket 
router.post("/createFolderBucket", Auth.userAuthMiddleware, async (req, res) => {
    const folderName = req.body.folderName;
    if (!folderName) {
        return res.json({ status: false, message: "Folder Name is Mandatory" });
    }
    const rootFolder = "bucketFolder";
    const folderpath = `${rootFolder}/${folderName}`;
    try {
        if (fs.existsSync(rootFolder)) {
            if (!fs.existsSync(folderpath)) {
                fs.mkdir(folderpath, (err) => {
                    if (err) {
                        console.error(err);
                        return res.status(500).json({ status: false, message: "Failed to create directory" });
                    }
                    return res.json({ status: true, success: "Directory created" });
                });
            }
        } else {
            fs.mkdir(rootFolder, (err) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ status: false, message: "Failed to create root directory" });
                }
                if (!fs.existsSync(folderpath)) {
                    fs.mkdir(folderpath, (err) => {
                        if (err) {
                            console.error(err);
                            return res.status(500).json({ status: false, message: "Failed to create directory" });
                        }
                        return res.json({ status: true, success: "Directory/Folder created" });
                    });
                }
            });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: false, message: "Internal server error" });
    }
});


// Define route to get Bucket List
router.get("/getAllFolderBucket", Auth.userAuthMiddleware, async (req, res) => {
    try {
        //joining path of directory 
        const directoryPath = path.join('bucketFolder');

        // Check if the directory exists
        if (!fs.existsSync(directoryPath)) {
            return res.status(404).json({ status: false, message: "Directory not found" });
        }

        // Read the directory contents
        const files = fs.readdirSync(directoryPath);

        // Filter directories
        const directories = files.filter(file => {
            const filePath = path.join(directoryPath, file);
            return fs.statSync(filePath).isDirectory();
        });

        console.log(directories);
        return res.json({ status: true, success: directories });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ status: false, message: "Internal server error" });
    }
});

// using multer
// Upload Files to a Bucket and store the same to MongoDB
router.post("/uploadFileInBucket", Auth.userAuthMiddleware, upload().single("myFile"), async (req, res) => {
    try {
        if (req.file) {
            // Calculate the URL based on your server configuration and the filename
            const baseUrl = 'https://yourdomain.com/uploads/'; // Replace with your server's base URL
            const fileUrl = baseUrl + req.file.filename;

            // Ensure that req.user is properly populated by the authentication middleware
            if (!req.user || !req.user._id) {
                return res.status(401).json({ status: false, message: "Unauthorized" });
            }

            // Create a new instance of the uploadModel with user ID, file details, and URL
            const uploadedData = new uploadModel({
                userId: req.user._id, // Assuming user ID is stored in req.user._id
                filename: req.file.filename,
                mimeType: req.file.mimetype,
                path: req.file.destination, // Store the path as before (if needed)
                url: fileUrl // Store the URL
            });
            await uploadedData.save(); // Save the uploaded data to the database
            res.json({ status: true, success: "File Uploaded Successfully", url: fileUrl }); // Return the URL in the response
        } else {
            res.status(400).json({ status: false, message: "No file uploaded" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ status: false, message: "Internal Server Error" });
    }
});

// get list of all files from a Particular bucket
router.get("/getAllFilesFromParticularBucket", Auth.userAuthMiddleware, async (req, res) => {
    try {
        const bucketName = req.body.bucketName;
        const directoryPath = path.join(`bucketFolder/${bucketName}`);
        fs.readdir(directoryPath, (err, files) => {
            if (err) {
                return res.json({ status: false, message: `${bucketName}, No Such Bucket Found` });
            }
            const allfiles = files.filter(file => {
                const filePath = path.join(directoryPath, file);
                return fs.statSync(filePath).isFile();
            });
            console.log(allfiles);
            return res.json({ status: true, filesList: allfiles });
        });
    } catch (error) {
        console.log("error------->>", error);
    }
});

//download a Files from a Bucket
router.get('/downloadFile/:filename/:folderName', Auth.userAuthMiddleware, (req, res) => {

    const { filename, folderName } = req.params;
    const filePath = `bucketFolder/${folderName}/${filename}`;

    if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: 'File not found' });
    }
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    const fileStream = fs.createReadStream(filePath);

    fileStream.pipe(res);
});

// This will delete Files from a given Bucket/folder
router.post("/deleteFileBucket", async (req, res) => {
    const folderName = req.body.folderName;
    const fileName = req.body.fileName;
    if (!folderName) {
        return res.json({ status: false, message: "Folder Name is Mandatory" });
    }
    if (!fileName) {
        return res.json({ status: false, message: "File Name is Mandatory" });
    }
    const rootFolder = "bucketFolder";
    const folderpath = `${rootFolder}/${folderName}/${fileName}`;
    try {
        fs.unlink(folderpath, (err) => {
            if (err) {
                console.error(err);
                return;
            }
            console.log('File deleted successfully');
        });
        return res.json({ status: true, success: "File deleted successfully" });
    } catch (error) {
        return res.json({ status: false, success: error });
    }
});

// Delete Folder/Bucket only if it Empty
router.post("/deleteFolderBucket", async (req, res) => {
    const folderName = req.body.folderName;
    if (!folderName) {
        return res.json({ status: false, message: "Folder Name is Mandatory" });
    }
    const rootFolder = "bucketFolder";
    const folderpath = `${rootFolder}/${folderName}`;
    try {
        if (fs.existsSync(rootFolder)) {
            if (fs.existsSync(folderpath)) {
                fs.rmdirSync(folderpath);
                return res.json({ status: true, success: "Directory Deleted" });
            }
        }
        return res.json({ status: false, success: "Directory Not Found" });
    } catch (error) {
        return res.json({ status: true, success: "Directory can't be deleted because it Not Empty" });
    }
});

module.exports = router;