const fs = require('fs');
const express = require('express'); // Import express module
const router = express.Router(); // Create an instance of the router
const path = require('path'); // Import path module
const Auth = require('../middleware/auth.middleware');

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



module.exports = router;