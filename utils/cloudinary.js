import cloudinary from ("cloudinary").v2;
import Restaurant from "../models/restaurant/restaurantModel.js";

cloudinary.config({
    cloud_name: "duyy9tytg",
    api_secret: "gUWVD8ZsfPsR39p2DPQe007nDu4",
    api_key: "143199812994479"
})


const uploads = (restaurantId, files) => {
    return new Promise(async (resolve, reject) => {
        try {
            const folderName = `/restaurants/${restaurantId}/`;
            console.log(folderName)
            const options = {
                folder: folderName,
                resource_type: 'auto'
            };
            const uploadPromises = files.map(file =>
                cloudinary.uploader.upload(file.path, options)
            );
            const results = await Promise.all(uploadPromises);
            const pictures = results.map(result => ({
                url: result.url,
                public_id: result.public_id
            }));

            resolve(pictures);
        } catch (error) {
            reject(error);
        }
    });
};

const delPicture = async (publicId, owner_id) => {
    return new Promise(async (resolve, reject) => {
        try {
            const findRestaurant = await Restaurant.findOne({ owner: owner_id });
            if (findRestaurant) {
                const result = await cloudinary.uploader.destroy(`${publicId}`);
                if (!result || result.result !== "ok") {
                    console.log("Failed to delete picture from Cloudinary");
                    return reject(new Error("Failed to delete picture from Cloudinary"));
                } else {
                    findRestaurant.pictures = findRestaurant.pictures.filter((p) => p.public_id !== publicId);
                    await findRestaurant.save();
                    return resolve(true);
                }
            } else {
                return reject(new Error("Restaurant not found"));
            }
        } catch (error) {
            console.log(error);
            return reject(error);
        }
    });
};


export { uploads, delPicture };