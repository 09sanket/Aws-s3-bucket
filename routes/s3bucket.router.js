const fs = require('fs');
const router = require('express').Router();
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

module.exports = router;
