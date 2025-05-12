
  // Import the functions you need from the SDKs you need
  import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
  import { getAuth, createUserWithEmailAndPassword,signInWithEmailAndPassword,onAuthStateChanged,signOut } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
  import { getFirestore,collection,doc,setDoc,serverTimestamp,query,orderBy,limit,getDoc,getDocs } from 'https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js'
  import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-storage.js"
  // TODO: Add SDKs for Firebase products that you want to use
  // https://firebase.google.com/docs/web/setup#available-libraries

  // Your web app's Firebase configuration
  const firebaseConfig = {

  };


  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  //Initialize Cloud Firestore
  const db =getFirestore(app);
  //Initialize Firebase Storage
  const storage = getStorage(app);
  //Initialize Firebase authentication
  const auth = getAuth(app);
  //add listener to auth for authentication state change
  onAuthStateChanged(auth,(user)=>{
    if(user){
        //User is signed in
        //add nav links to nav element, index, about, buy, sell, account icon, logout icon
        document.querySelector("nav ul").innerHTML=`
        <li><a href="index.html">Home</a></li>
        <li><a href="about.html">About</a></li>
        <li><a href="buy.html">Buy</a></li>
        <li><a href="sell.html">Sell</a></li>
        <li><img src="icons/user.png" id="user-account" alt=""/></li>
        <li><img src="icons/logout.png" id="logout" alt=""/></li>`;
        //get logout button and add event listener
        const logOutBtn = document.getElementById("logout");
        logOutBtn.addEventListener('click', logOut);
      
    }else{
        //add nav links to nav element, index, about, buy, login, sign up
        document.querySelector("nav ul").innerHTML=`
        <li><a href="index.html">Home</a></li>
        <li><a href="about.html">About</a></li>
        <li><a href="buy.html">Buy</a></li>
        <li><a href="login.html">Login</a></li>
        <li><button><a href="signup.html">Sign Up</a></button></li>`;
    }
  })

  //add event listener to window
  window.addEventListener("load",init);



  function init(){
    //get current pathname of window
    let pathname = window.location.pathname;
    // call functions or assign event listeners depending on pathnamee
    switch(pathname){
      case "/index.html":
        getListings(4);
        break;
      case "/buy.html":
        getListings();
        break;
      case "/login.html":
        const loginBtn = document.getElementById("login");
        loginBtn.addEventListener('click', logIn);
        break;
      case "/signup.html":
        const signUpBtn = document.getElementById("register");
        signUpBtn.addEventListener('click', signUp)
        break;
      case "/sell.html":
        window.previewImage=previewImage;
        const createListingBtn = document.getElementById("create-listing");
        createListingBtn.addEventListener('click', createListing);
        break;
      case "/product.html":
        productDetails();
    }
  }

  
  function signUp(event){
    event.preventDefault();
    //get input values
    const email= document.getElementById("email").value;
    const password=document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirm-password").value;

    //check if pasword and confirm password match
    if(password===confirmPassword){
      // create user with firebase
      createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
      // Signed up 
      const user = userCredential.user;
      //redirect to index page
      window.location.href="index.html"
      })
      .catch((error) => {
          const errorMessage = error.message;
          //display error message
          alert(errorMessage);
          // ..
      });
    }else{
      // display message to user
      alert("passwords do not match, please check and eneter again");
    }


};

function logIn(event){
  event.preventDefault();
  //get input values
  const email= document.getElementById("email").value;
  const password=document.getElementById("password").value;
  //sign in with firebase
  signInWithEmailAndPassword(auth, email, password)
  .then((userCredential) => {
  // Signed In
  const user = userCredential.user;
  //redirect to index page
  window.location.href="index.html"
  console.log("user signed in")
      // ...
  })
  .catch((error) => {
      const errorMessage = error.message;
      //display error message
      alert(errorMessage);
      // ..
})}

function logOut(event){
  event.preventDefault();
  //signout with firebase
  signOut(auth).then(() => {
      // Sign-out successful.
      console.log("user signed out");
    }).catch((error) => {
      // An error happened.
      alert(error);
    });
}

let fileInput={}
function previewImage(event){
  //get img element
  const img = document.getElementById("preview-image")
  //update fileInput with file added
  fileInput=event.files[0];
  //update img with image of file just added
  img.src=URL.createObjectURL(fileInput);

}

async function createListing(event){
  event.preventDefault();
  //get input values
  const productTitle= document.getElementById("product-title").value;
  const productPrice = document.getElementById("product-price").value;
  const productDescription = document.getElementById("product-description").value;
  try{
    //create document ID
    const docRef = doc(collection(db,"product-details"));
    //get the current user
    const currentUser = auth.currentUser;
    //create image url where image will be stored in storage
    const imageURL = `/images/${docRef.id}/${fileInput.name}`;
    //create document details to be uploaded
    const productDetails = {
      title: productTitle,
      price: productPrice,
      description: productDescription,
      image_url: imageURL,
      user: currentUser.email,
      timestamp: serverTimestamp()
    };
    //add the product details to the document Id created earlier
    await setDoc(docRef,productDetails);
    //set the location to upload image to
    const storageRef = ref(storage,imageURL);
    //upload image
    uploadBytes(storageRef,fileInput).then((snapshot)=>{
      //upload successful
      //reset sell form
      document.getElementById("sell-form").reset();
      //set preview image back to upload icon
      document.getElementById("preview-image").src='icons/photo.png';
      alert("Listing Created");
    })
  }catch(error){
    console.log(error);
  }
}

async function getListings(quantity=0){
  //get listing container element
  const listingContainer = document.querySelector(".listing-container");
  // variable to hold query
  let q;
  //check listing quantity
  if(quantity>0){
    //if specified limit documents returned to quantity
    q = query(collection(db,"product-details"),orderBy("timestamp", "desc"),limit(quantity));
  }else{
    //not specified, get all documents
    q = query(collection(db,"product-details"),orderBy("timestamp", "desc"));
  }
  //get documents from firestore
  const querySnapshot = await getDocs(q);
  //loop through documents
  querySnapshot.forEach((doc)=>{
    //get image location
    const imageURL=doc.data().image_url
    //create product url with search param
    const href = "product.html"+"?productID="+doc.id
    //download image for listing
    getDownloadURL(ref(storage,imageURL))
    .then((url) =>{
      //insert listing details and image to listing container
      listingContainer.insertAdjacentHTML("beforeend",`
    <div class="listing-item">
      <div class="listing-item-image">
        <a href=${href}><img src="${url}" alt=""></a>
      </div>
      <div class="listing-item-text">
        <p class="listing-item-title">${doc.data().title}</p>
        <p class="listing-item-price">£${doc.data().price}</p>
      </div>
    </div>
    `)
    }).catch((error)=>{
      console.log(error);
    })
  })
}

async function productDetails() {
  //get window search params
  const paramString = window.location.search;
  const searchParams = new URLSearchParams(paramString);
  //get the value of productID search param
  const docID= searchParams.get("productID");
  //set the firestore document location
  const docRef = doc(db,"product-details",docID);
  //get the output elements
  const productTitle = document.querySelector("#product-details-text h2");
  const productPrice = document.querySelector("#product-details-text h3");
  const listingtDate = document.querySelector("#product-details-text h4");
  const productDescription= document.querySelector("#product-details-text p");
  const productImage = document.querySelector("#product-details-image img");
  try{
    //get the document from firestore
    const docSnap = await getDoc(docRef);
    //get the products image location
    const imageURL = docSnap.data().image_url;
    //get the timestamp and convert it to date string
    const time = docSnap.data().timestamp;
    const date = time.toDate().toDateString();
    //set the text content of output elements with product details
    document.querySelector("title").textContent=docSnap.data().title;
    productTitle.textContent=docSnap.data().title;
    productPrice.textContent="£"+docSnap.data().price;
    listingtDate.textContent="Listing created on: "+date;
    productDescription.textContent=docSnap.data().description;
    //download the product image
    getDownloadURL(ref(storage,imageURL))
    .then((url)=>{
      //display downloaded image
      productImage.setAttribute('src',url);
    })
  }catch(error){
    document.querySelector("title").textContent="Product Not Found";
    productTitle.textContent="Product Not Found";
    console.log(error);
  }
    
}
