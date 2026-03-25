#let assignment(
  title: "",
  course: "",
  author: "Your Name",
  date: none,
  body
) = {
  // Set document properties
  set document(title: title, author: author)
  
  // Set page with beige background
  set page(
    paper: "us-letter",
    margin: (x: 1.5in, y: 1in),
    fill: rgb("#fbf1c7"), // Gruvbox bg0
    header: context {
      if counter(page).get().first() > 1 [
        #set text(fill: rgb("#3c3836"), size: 9pt)
        #author
        #h(1fr)
        #course
      ]
    },
    numbering: "1",
  )
  
  // Set text properties
  set text(
    font: "IBM Plex Serif",
    size: 11pt,
    fill: rgb("#000000"), // Gruvbox fg - slightly off black
  )
  
  // Heading styles
 set heading(numbering: "1.")
  show heading.where(level: 1): it => {
    set text(size: 18pt, weight: "bold", fill: rgb("#d65d0e")) // Gruvbox orange
    it
    v(0.5em)
  }
  
  show heading.where(level: 2): it => {
    set text(size: 14pt, weight: "semibold", fill: rgb("#af3a03")) // Gruvbox orange dark
    it
    v(0.3em)
  }

  
  // Paragraph spacing
  set par(justify: true, leading: 0.65em)
  show par: set block(spacing: 1.2em)

  // Figure spacing
  show figure: set block(spacing: .8em)
  
  // Title page header
  align(center)[
    #set text(size: 20pt, weight: "bold", fill: rgb("#d65d0e"))
    #title
    #v(0.3em)
    #set text(size: 12pt, weight: "regular", fill: rgb("#4f4944"))
    #course
    #v(0.2em)
    #set text(size: 11pt)
    #author
    #if date != none [
      | #date
    ] else [
      | #datetime.today().display("[month repr:long] [day], [year]")
    ]
  ]
  
  v(1.5em)
  
  body
}

// Usage example:
#show: assignment.with(
  title: "Software Design Project",
  course: "COMSC 330",
  author: "Spark Team",
  date: "Spring, 2026", // Optional
)

= Overview
The goal of our project is to create a scheduling application that will allow teachers and students to decide on a proper time to schedule a class. 
//The flow of our application as it stands is the following:
//#figure(image("flow.svg"))

== Technologies
Our project will use the following technologies:
#show link: underline
- #link("https://react.dev")[React Javascript Framework] 
- #link("https://tailwindcss.com")[Tailwind CSS (styling)]
- #link("https://fastapi.tiangolo.com/")[FastAPI]
- #link("https://sqlmodel.tiangolo.com/")[SQLModel]

== JSON Schema
Our goal is to have a working frontend that will allow the students available times to be defined in a JSON file. The schema for that file should follow the following structure:
```json
{
  "version": "1.0",
  "eventHash": "abc123xyz",
  "user": {
    "name": "Jane Student",
    "email": "jane@student.edu"
  },
  "availability": [
    {
      "slotId": 1,
      "status": "available"
    },
    {
      "slotId": 7,
      "status": "available"
    },
    {
      "slotId": 25,
      "status": "preferred"
    }
  ],
  "submittedAt": "2026-02-13T14:30:00Z"
}
```
== Installation <install>

=== Frontend
1. Install Node.js
Visit #link("https://nodejs.org/en/download") and click the Windows Installer (.msi) button. Accept all the default settings, make sure you click _Automatically Install the necessary tools_. Additional windows may appear, just follow prompts.

2. #link("pnpm.io/installation")[Install pnpm package manager]
Now we need to install our package manager. Open a command prompt as administrator and run the following:
```bash
node --version
npm --version
```
Both commands should spit back the version you are on. If not repeat the node installation steps. Run the following:
```bash
corepack enable pnpm
pnpm --version
```
You may be prompted about the download, enter _y_. At this point you are all ready to start work on the application.

=== Backend
1. Before anything can be done you must enable #link("https://learn.microsoft.com/en-us/windows/wsl/install")[Windows Subsystem for Linux (WSL)].
This can be done by running the following command from within a powershell terminal:
```bash
wsl --install
```
This might take anywhere from 5-20 minutes. We will need this in order to continue with the next steps.

2. Download #link("https://docs.docker.com/desktop/setup/install/windows-install/")[docker desktop] and install it.
After it is installed open a powershell terminal and navigate to whatever directory the git repository is located in. Change directories until you are in the *backend* directory. You should see a _docker-compose.yml_ file. In order to get this container running simply enter:
```bash
docker compose up -d
```
3. Now we need to create a .env variable.
It is very important that this *never* gets pushed to the Git repo (not all that important in our case but a good practice nonetheless). The .gitignore file should prevent this from happening automatically. The easiest way to do this on windows is just to copy and paste the following commands:

```bash
New-Item -Path ".env" -ItemType File
Set-Content -Path ".env" -Value 'DATABASE_URL = "mysql+pymysql://devuser:devpassword@localhost:3307/schedulerDB"'
```

4. Next we will need to create a venv (virtual environment) file to allow us to install python packages to.

```bash
python -m venv venv
```
At this point you can either activate the venv right from the commandline:

```bash
# In cmd.exe
venv\Scripts\activate.bat
# In PowerShell
venv\Scripts\Activate.ps1
```
or alternatively we can switch to vscode (this is assuming you already have the repository opened in vscode) where we will type _control + shift + p_ and search for _Python: Select Interpreter_, and then click the venv we just created. At this point we can move onto the next steps.

6. Ensure that you have pip installed on your device. We will need this because it does exactly what it stands for (pip installs packages). It should come pre-installed with python, but we can verify by running:
```bash
py -m ensurepip --upgrade
#and
pip --version
```
Now we need to install the packages that we are using in our project.

```bash
pip install pymysql fastapi[standard] "uvicorn[standard] sqlmodel python-dotenv"
```
It is important to note that there might be additional packages that need installing depending on what features get added and how the project progresses.

We are now ready to move onto running both the backend and frontend.

= Running The Application

=== Frontend
1. Clone the team repository from GitHub & change into the directory:
```bash
git clone https://github.com/MatthewKaminskiRWU/Principles-of-Software-Design---Team-5.git
cd Principles-of-Software-Design--Team-5
cd frontend
```
This is where all of our files will live. In order to get the website running in your local browser:
1. Install dependencies with ```bash pnpm install```
2. Start the webserver with ```bash pnpm dev```
3. Navigate to ```cmd http://localhost:5173/``` on your browser. 

=== Backend

1. Navigate to the project directory (you should already be here) and then to the backend.

```bash
cd backend
# make sure the venv is activated (see step 4 of section 1.3.2)
```
Start the fastAPI backend server:

```bash
fastapi dev main.py
```
If this runs correctly you will see a bunch of messages. Look for the one that says Documentation at http://127.0.0.1:8000/docs and navigate to that link.

This is where we are able to test our endpoints and see that they work.It also displays the schemas we defined which is really helpful. 

A simple way to see if everything is working correctly on the backend is to simply navigate to http://127.0.0.1:8000/users/. You should get back a json object.

== Resources
There are a lot of new technologies to get familiar with. I would recommend the following as a good starting point: 
- #link("https://www.w3schools.com/html/html_basic.asp")[w3schools html basics]
- #link("https://www.w3schools.com/html/html_basic.asp")[React docs]
- #link("https://tailwindcss.com/docs/styling-with-utility-classes")[Tailwindcss core concepts]
- #link("https://www.geeksforgeeks.org/node-js/rest-api-introduction/")[REST API basics]
- #link("https://fastapi.tiangolo.com/")[FastAPI docs]
- #link("https://sqlmodel.tiangolo.com/")[SQLModel docs]
- #link("https://docs.docker.com/get-started/docker-overview/")[What is Docker?]
- #link("https://mariadb.com/docs/server/mariadb-quickstart-guides/mariadb-sql-cheat-cheat-guide")[MariaDB basic SQL queries]


= Git Workflow
It is imperative that we keep our code well documented and organized. We can use Git to keep the repository tidy.

Say you are building the feature to show class time slots. Your workflow would be as follows:

```bash
# When you start a coding session first return to the main branch:
git checkout main
# pull the latest changes
git pull origin main
# now make a new branch for whatever feature you are working on 
git checkout -b feature/time-slot-grid

# after programming for a bit add your changes
git add .
# and add a descriptive note as to what you worked on
git commit -m "Create TimeSlotGrid component"
# then send the changes to our GitHub repository
git push origin feature/time-slot-grid

# keep coding... 
git add .
git commit -m "Add click selection to grid"
git push origin feature/time-slot-grid

# now that you are done for the day - go to GitHub.com
# Click "Pull Requests" → "New Pull Request"
# Select your branch → Create PR
# Ask teammate: "Hey can you review my PR?"
# Teammate approves → Click "Merge"
# Done! Delete the branch on GitHub
```
