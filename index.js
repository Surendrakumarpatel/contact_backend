import express from "express";
import cors from "cors";
import dbConnection from './database.js';
import dotenv from "dotenv";
import User from "./models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
 
dotenv.config();
const app = express();
const PORT = process.env.PORT || 8080;


// database connection
dbConnection();

// middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

 
// generateToken
const generateAuthToken = (_id) => {
    return jwt.sign({ _id }, process.env.SECRET, { expiresIn: '5d' })
}


//  Register user
app.post("/api/user/register", async (req, res) => {
    const { name, email, password, cPassword} = req.body;
    

    if(password !== cPassword){
        return res.status(401).json({
            success:false,
            message:"Password didn't match"
        })
    }
    
    let user = await User.findOne({ email });

    if (user) {
        return res.status(400).json({
            success: false,
            message: "User Already Exits",
        })
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user = await User.create({
        name,
        email,
        password: hashedPassword
    })

    const token = generateAuthToken(user._id);

    res.status(200).json({
        success: true,
        message: "User Registered Successfully!",
        user,
        token
    })

});

// login User
app.post("/api/user/login", async (req, res) => {
    const { email, password } = req.body;
 
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(401).send({
            success: false,
            message: "Incorrect Email or Passsword"
        }) 
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(401).json({
            success: false,
            message: "Incorrect Email or Passsword"
        })
    }

    const token = generateAuthToken(user._id);

    res.status(200).json({
        success: true,
        message: `Welcome back, ${user.name}`,
        user,
        token
    })
})

// Create Contacts 
app.post("/api/contacts/createContact", async (req, res) => {

    const { firstName, lastName, email, phoneNumber, creatorEmail } = req.body;
    const newElement = { firstName, lastName, email, phoneNumber };
    User.findOneAndUpdate(
        { email: creatorEmail },
        { $push: { contacts: newElement } },
        { new: true }
    )
        .then(updatedDocument => {
            if (updatedDocument) {
                return res.status(200).json({
                    success: true,
                    message: "Contact Created Successfully!"
                })
            } else {
            }
        })
        .catch(error => {
            console.error('Error updating document:', error);
            return res.status(200).json({
                success: true,
                message: "Error creating contact:"
            })
        });

})

// Get All Contacts 
app.post("/api/contacts/getAll", async (req, res) => {
    const { contacts } = await User.findOne({ email: req.body.creatorEmail });
    res.status(201).json({
        contacts,
    });
})


// Get single Contacts 
app.post("/:id", async (req, res) => {
    const id = req.params.id;

    User.findOne(
        { email: req.body.creatorEmail, "contacts._id": id },
        { 'contacts.$': 1 }
    )
        .then(foundDocument => {
            if (foundDocument) {
                const childDocument = foundDocument.contacts[0];
                console.log('Found document:', childDocument);
                res.status(201).json({
                    contact: childDocument
                });
            } else {
                console.log('Parent document not found or child document not found within the array.');
                res.status(201).json({
                    message: "Error finding details"
                });
            }
        })
        .catch(error => {
            console.error('Error finding document:', error);
        });

})

// Delete Contact
app.delete("/:id/:email", async (req, res) => {
    console.log(req.params.email)
    console.log(req.params.id)
    const { id } = await User.findOne(
        { email: req.params.email },
    );


    User.findByIdAndUpdate(id, { $pull: { contacts: { _id: req.params.id } } }, { new: true })
        .then((document) => {
            if (!document) {
                console.log('Document not found');
                return;
            }

            console.log('Element removed successfully');
        })
        .catch((err) => {
            console.error(err);
        });


    res.status(201).json({
        success: true,
        message: "Contact Deleted Successfully"
    });
})


// Updating Contact
app.put("/:id", async (req, res) => {
 
    const updatedContact = {
        ...req.body,
        creatorEmail: null
    };

    User.findOneAndUpdate(
        { email: req.body.creatorEmail, "contacts._id": req.params.id },
        { $set: { "contacts.$": updatedContact } },
        { new: true }
    )
        .then((user) => {
            if (!user) {
                console.log('User not found');
                return;
            }

            console.log('Contact updated successfully');
            console.log(user);
            res.status(201).json({
                success: true,
                message: "Contact Updated Successfully!"
            })
        })
        .catch((error) => {
            console.error(error);
            res.status(201).json({
                success: true,
                message: "Error Updating contact!"
            })
        });


})
 
app.listen(PORT, () => {
    console.log(`Server running at PORT ${PORT}`);
})