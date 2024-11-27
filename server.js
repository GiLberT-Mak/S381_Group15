const express       = require('express');
const app           = express();
const path          = require("path");
const session       = require("express-session");
const formidable    = require("express-formidable");
const mongodb       = require("mongodb");
const bcrypt        = require("bcrypt");
const passport      = require("passport");
const flash         = require("express-flash");
var fsPromises = require('fs').promises;
var {MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const users = [];

//APP
app.set("view engine", "ejs");
app.use(express.static('public'));
app.use(formidable());
app.use(flash());
app.use((req,res,next) => {
    let d = new Date();
    console.log(`TRACE: ${req.path} was requested at ${d.toLocaleDateString()}`);  
    next();
});

//cookie: 
app.use(session({
    secret: "thiSiSasEcREtStr",
    cookie: {
        httpOnly: false,
      },
    resave: false,
    saveUninitialized: false
}));
//connect to mongodb
const mongourl = 'mongodb+srv://GiLberT:Energy1204@cluster0.2yvt4.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const dbname = 'S381GP';
const collectionName = 'accounts';
const listCollectionName = 'to-do-list'
const client = new MongoClient(mongourl, {
	serverApi: {
		version: ServerApiVersion.v1,
		strict: true,
		deprecationErrors: true,
	}
});
//Autherize functions:
const isLoggedIn = (req, res, next) => {
  if (req.session && req.session.user) {
    return next();
  } else {
    res.redirect('/login');
  }
};
const findAccount = async (db, doc) => {
	var collection = db.collection(collectionName);
	let result = await collection.find(doc).toArray();
	console.log("Find the account's data: " + JSON.stringify(result));
	return result;
};
const newAccount = async (db, doc) => {
	var collection = db.collection(collectionName);
	let result = await collection.insertOne(doc);
	console.log("Created new account:" + JSON.stringify(result));
	return result;
};
//Handle Login/Sign-up
const handle_newAcc = async (req, res) => {
	const db = client.db(dbname);
    await client.connect();
	console.log("Connected successfully to server");
	try{
        const salt = await bcrypt.genSalt();
        const hasdedPW = await bcrypt.hash(req.fields.password, salt);
        console.log(salt);
        console.log(hasdedPW);
        let newAcc = {username: req.fields.username, email: req.fields.email, password: hasdedPW};
        await newAccount(db, newAcc);
        res.redirect('/login');
    } catch {
        res.redirect('/signup');
    }
};
const handle_Login = async (req, res) => {
    const db = client.db(dbname);
    await client.connect();
	console.log("Connected successfully to server");
    const useremail = { email: req.fields.email }
	try{
        const userInfo = await findAccount(db, useremail);
        console.log(userInfo);
        if (userInfo.length > 0) {
            const validPassword = await bcrypt.compare(req.fields.password, userInfo[0].password);
            if (validPassword) {
              req.session.user = userInfo[0]; // Set the session user
              res.redirect("/home");
            } else {
              res.redirect("/login");
              console.log("wrong pw")
            }
          } else {
            res.redirect("/login");
          }
    }catch(error){
        console.error("Error logging in:", error);
        res.status(500).send("Internal Server Error");
    }finally{
        await client.close();
        console.log("database closed")
    }
};
//List Function:
const insertDocument = async (db, doc) => { 
	var collection = db.collection(listCollectionName); 
	let result = await collection.insertOne(doc); 
	console.log("insert one document:" + JSON.stringify(result)); 
	return result; 
};
const findDocument = async (db, criteria) => { 
	var collection = db.collection(listCollectionName); 
	let result = await collection.find(criteria).toArray(); 
	console.log("Returned document:" + JSON.stringify(result)); 
	return result;
} 
const updateDocument = async (db, criteria, updateData) => { 
	const collection = db.collection(listCollectionName); 
	const result = await collection.updateOne(criteria, {$set: updateData }); // Use `$set` to update fields 
	console.log("Update result:", result); 
	return result; // Return the result object 
} 
const deleteDocument = async (db, criteria) => { 
	var collection = db.collection(listCollectionName); 
	let result = await collection.deleteOne(criteria); 
	console.log("Deleted document:" + JSON.stringify(result)); 
	return result; 
}
//Handle_Request:
const handle_HomePage = async (req, res, criteria = {}) => {
    await client.connect(); 
	console.log("Connected successfully to server");
    const userid={userid : criteria.user._id.toString()};
    console.log(userid);
	try { 
	  const db = client.db(dbname);
	  const docs = await findDocument(db, userid); // Ensure this function works 
	  res.status(200).render("home.ejs", {  
		Tasks: docs, 
		user: req.session.user, 
	  }); 
	} catch (err) { 
	  console.error("Error in handle_Find:", err); 
	  res.status(500).send("Internal Server Error"); 
	} 
}; 
const handle_Create = async (req, res) => { 
	await client.connect(); 
	console.log("Connected successfully to server"); 
	const db = client.db(dbname);
	let newDoc = { 
		userid: req.session.user._id, 
		taskname: req.fields.taskName,
        deadline: req.fields.deadlineDate,
		content: req.fields.taskContent 
	}; 
	await insertDocument(db, newDoc); 
	res.redirect('/'); 
}
const handle_Details = async (req, res, criteria) => { 
	await client.connect(); 
	console. log("Connected successfully to server"); 
	const db = client.db(dbname); 
    // Convert _id to ObjectId
	let DOCID = { _id: ObjectId.createFromHexString(criteria._id) }; 
	const docs = await findDocument(db, DOCID); 
	res.status(200).render('details', { Tasks: docs[0], user: req.session.user}); 
}
const handle_Edit = async (req, res, criteria) => { 
	await client.connect(); 
	console. log("Connected successfully to server"); 
	try { 
        const db = client.db(dbname); 
        let DOCID = req.query._id; 
		console.log(DOCID); 
        try { 
            // Convert `_id` to ObjectId 
            DOCID = { _id: new ObjectId(criteria._id) }; 
        } catch (err) { 
            return res.status(400).render("info", {  
                message: "Invalid booking ID format!",  
                user: req.user  
            }); 
        } 
        // Fetch the document from the database 
        const doc = await findDocument(db, DOCID); 
        const tasks = doc[0]; // The fetched document 
        // Render the edit page with the booking data 
        res.status(200).render("edit", { Tasks: tasks, user: req.session.user }); 
    } catch (err) { 
        console.error("Error in handle_Edit:", err); 
        res.status(500).send("Internal Server Error"); 
    } 
}; 
const handle_Update = async (req, res, criteria, query) => {
    await client.connect();
    console.log("Connected successfully to server");
    try { 
        const db = client.db(dbname); 
        let DOCID; 
        // Convert _id to ObjectId 
        DOCID = { _id: ObjectId.createFromHexString(query._id) }; 
        
		let updateFields = { 
			taskname: req.fields.taskName,
            deadline: req.fields.deadlineDate,
		    content: req.fields.taskContent 
		}; 
        // Perform the update operation 
        const result = await updateDocument(db, DOCID, updateFields);
        if (result.modifiedCount === 1) { 
            return res.status(200).render("popup", { 
                message: "Booking updated successfully!", 
                user: req.session.user, 
            }); 
        } else { 
            // If the document was found but no changes were made 
            return res.status(400).render("popup", { 
                message: "No changes were made to the booking.", 
                user: req.session.user, 
            }); 
        } 
    } catch (err) { 
        // Handle unexpected errors 
        console.error("Error in handle_Update:", err); 
        return res.status(500).render("popup", { 
            message: "An error occurred while updating", 
            user: req.session.user, 
        }); 
    } 
};
const handle_Delete = async (req, res, query) => {
    await client.connect();
    console.log("Connected successfully to server");
    try {
        const db = client.db(dbname);
        const DOCID = { _id: ObjectId.createFromHexString(query._id) };
        const doc = await findDocument(db, DOCID);
        await deleteDocument(db, DOCID); // Delete the document 
        res.status(200).render("popup", { 
                message: `TaskName: ${doc[0].taskname} has been removed`, 
                user: req.session.user,
            });
    } catch (err) { 
        console.error("Error in handle_Delete:", err); 
        res.status(500).send("Internal Server Error"); 
    } 
}; 
//Render Pages:
app.get('/', isLoggedIn, (req, res) =>{
    res.redirect("/home");
})
//Login Page:
app.get('/login', (req, res) =>{
    res.render("login.ejs");
})
app.post('/login', (req, res) =>{
    handle_Login(req, res);
})
//Sign-In Page:
app.get('/signup', (req, res) =>{
    res.render("signup.ejs");
})
app.post('/signup', async (req, res) =>{
    console.log("recived");
    handle_newAcc(req, res);
})
//Home Page:
app.get('/home', isLoggedIn, (req, res) =>{
    handle_HomePage(req, res, {user: req.session.user});
})
//Create New Task:
app.get('/create', isLoggedIn, (req, res) =>{
    res.render("create.ejs");
})
app.post('/create', isLoggedIn, (req, res) =>{
    handle_Create(req, res);
})
//Detail Page:
app.get('/details', isLoggedIn, (req, res) => { 
	handle_Details(req, res, req.query); 
}); 
//Edit Page:
app.get('/edit', isLoggedIn, (req, res) => { 
	handle_Edit(req, res, req.query);
});
//Edit Function:
app.post('/update', isLoggedIn, (req, res) => { 
	handle_Update(req, res, req.fields, req.query) 
});
//Delete Function:
app.get('/delete', isLoggedIn, (req, res) => { 
	handle_Delete(req, res, req.query); 
});
//Logout:
app.get("/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).send("Internal Server Error");
      }
      res.redirect("/login");
    });
})
//Error Path:
app.get('/*', (req,res) => { 

    res.status(404).render('home', {message: `${req.path} - Unknown request!` }); 

})
//Set localhosting Port
const port = 7070;
app.listen(port, () => {
    console.log(`Server running on Port:, ${port}`);
})

console.log(users);