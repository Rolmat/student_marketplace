
  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
  import { getAuth, createUserWithEmailAndPassword,signInWithEmailAndPassword,onAuthStateChanged,signOut } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  const firebaseConfig = {
    apiKey: "AIzaSyDEgE-SrzdhEzbzXcFZQ9ZqZVQ6evLvE2w",
    authDomain: "integrated-group-project.firebaseapp.com",
    projectId: "integrated-group-project",
    storageBucket: "integrated-group-project.firebasestorage.app",
    messagingSenderId: "1069923170210",
    appId: "1:1069923170210:web:042d761a38e67c6cf124fb"
  };

  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  onAuthStateChanged(auth,(user)=>{
    if(user){
        //User is signed in
        document.querySelector("nav ul").innerHTML='<li><a href="index.html">Home</a></li><li><a href="about.html">About</a></li><li><a href="buy.html">Buy</a></li><li><a href="sell.html">Sell</a></li><li><img src="icons/user.png" id="user-account" alt=""/></li><li><img src="icons/logout.png" id="logout" alt=""/></li>';
        const logOutBtn = document.getElementById("logout");
        logOutBtn.addEventListener('click', logOut);
      
    }else{
        document.querySelector("nav ul").innerHTML='<li><a href="index.html">Home</a></li><li><a href="about.html">About</a></li><li><a href="buy.html">Buy</a></li><li><a href="login.html">Login</a></li><li><button><a href="signup.html">Sign Up</a></button></li>';
    }
  })

  window.addEventListener("load",init);

  function init(){
    let pathname = window.location.pathname;
    switch(pathname){
      case "/index.html":
        console.log("home");
        break;
      case "/buy.html":
        console.log("buy");
        break;
      case "/login.html":
        console.log("login");
        const loginBtn = document.getElementById("login");
        loginBtn.addEventListener('click', logIn);
        break;
      case "/signup.html":
        const signUpBtn = document.getElementById("register");
        signUpBtn.addEventListener('click', signUp)
        break;
    }
  }

  
  function signUp(event){
    event.preventDefault();
    //input fields
    const email= document.getElementById("email").value;
    const password=document.getElementById("password").value;

    createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
    // Signed up 
    const user = userCredential.user;
    window.location.href="index.html"
        // ...
    })
    .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        alert(errorMessage);
        // ..
    });
};

function logIn(event){
  event.preventDefault();
  //input fields
  const email= document.getElementById("email").value;
  const password=document.getElementById("password").value;

  signInWithEmailAndPassword(auth, email, password)
  .then((userCredential) => {
  // Signed In
  const user = userCredential.user;
  window.location.href="index.html"
  console.log("user signed in")
      // ...
  })
  .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      alert(errorMessage);
      // ..
})}

function logOut(event){
  event.preventDefault();
  signOut(auth).then(() => {
      // Sign-out successful.
      console.log("user signed out");
    }).catch((error) => {
      // An error happened.
      alert(error);
    });
}
