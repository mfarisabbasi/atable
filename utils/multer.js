import multer from "multer";


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) { cb(null, Date.now().toString() + '-' + file.originalname) }
})

//only jpeg and png supported files can be uploaded.

const fileValidator = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        cb(null, true)
    } else {
        cb({ message: "unsupported file format" }, false)
    }
}
//file can be of only 5 mb.
const upload = multer({

    storage: storage,
    fileFilter: fileValidator,
    limits: { fileSize: 1024 * 1024 * 5 }

})

export { upload };
