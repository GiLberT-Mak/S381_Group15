# **Project Name** : TO-DO-List Website <br>
- ### **Application Link** (Cloud Url) :  [TO-DO-List](https://s381f-group15.onrender.com)

#  **Group.No15**
**Members:**
+  <ins>Mak Hou Wai        13141934
+  <ins>Sun Tsz Hin        13515278
+  <ins>Chu yat Long       13138813
+  <ins>Chan Tsz Ho        13077876 

***

# **Project file intro:**
- ### server.js : It provided these functions, Which inculded<br>
> - **Setup the Server** (Express/ Middleware / View Engine / ... )
> - **Connect to Datebase** (mongodb)
> - **User Authentication** (Login / Logout / Register)
> - **Task Management** (Create / Edit / Delete / View)
> - **Start the Server** (Held the server in localhost and Listen to Port)
- ### package.json : List of dependencies<br>
> - "bcrypt",
> - "connect-mongodb-session",
> - "ejs",
> - "express",
> - "express-formidable",
> - "express-session",
> - "fs",
> - "mongodb"
> - "nodemon"
- ### public : static files included<br>
> - style.css
> - createstyle.css 
> - homestyle.css
> - detailstyle.css
> - popup.css
> - img.jpg 
> - create.jpge
- ### views : EJS files included<br>
> - login.ejs
> - signup.ejs
> - home.ejs
> - create.ejs
> - details.ejs
> - edit.ejs
> - popup.ejs

***

# **The cloud-based server URL for testing:**<br>https://s381f-group15.onrender.com

***

# **Opreation Guides:**
- ### The Login/Register pages:
   In register page, User can create their own account with email and password. Also remenber to have a Username.<br>Then in login page, user can login the website with email and password.
- ### The CRUD web pages :
  ### **Read** :
    - **Task Listing :** <br>The home.ejs page displays all tasks associated with the logged-in user. showing the task name and due date.
    - **Task Details :** <br>Users can click on a task to view its details, providing more information about the task and two buttons for ***EDIT*** and ***DELETE***.
    - **User Authentication :** <br> The home.ejs page will display the username upon login.
- ### **Create** :
    - **Task Creation :** <br> Users can add new tasks by clicking the "Create Your next TO-DO-ITEM"button in home.ejs page, which directs user to the create.ejs page.
    - **Task Item :** <br> Each To-Do-List item will have *Task Name*, *Task Deadline* and *Task Details* that provide by user. *Task Name*, *Task Deadline* must be enter by user and *Task Details* will be "N.A" by default.
- ### **Update** : 
    - **Edit Item :** <br> In Details page, by clicking the "Edit" button, which bring user to a edit page simaller to create page. It will already have the data of that item and user may edit anything on it.
    - **Handle different Situation :** <br> After editing the item, user will redirect to popup page that tells the user whether their **"Successfully update the item"** or **"Make no changes"**.
- ### **Delete** :
    - **Delete Item :** <br> In Details page, by clicking the "Delete" button, which render the popup page and tell the user that the item has been delete form the To-Do-List with the task's name.

***
# **RESTful API:**
Here are some RESTful CURD Service:

### 1. Sign Up

```bash
curl -X POST http://localhost:7070/signup \
-H "Content-Type: application/json" \
-d '{
    "username": "test222",
    "email": "222@test",
    "password": "12345"
}'
```

### 2. Log In

```bash
curl -X POST http://localhost:7070/login \
-H "Content-Type: application/json" \
-d '{
    "email": "222@test",
    "password": "12345"
}'
```

### 3. Get Home Page

```bash
curl -X GET http://localhost:7070/home
```

### 4. Create Task

```bash
curl -X POST http://localhost:7070/create \
-H "Content-Type: application/json" \
-d '{
    "taskName": "1234",
    "deadlineDate": "12/45",
    "taskContent": "helo"
}'
```
