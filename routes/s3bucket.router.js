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




module.exports = router;