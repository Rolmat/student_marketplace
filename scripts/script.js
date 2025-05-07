
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
        getListings(4);
        break;
      case "/buy.html":
        console.log("buy");
        getListings();
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
      case "/sell.html":
        console.log("sell")
        window.previewImage=previewImage;
        const createListingBtn = document.getElementById("create-listing");
        createListingBtn.addEventListener('click', createListing);
        break;
      case "/product.html":
        console.log("product");
        productDetails();
    }
  }

  
  function signUp(event){
    event.preventDefault();
    //input fields
    const email= document.getElementById("email").value;
    const password=document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirm-password").value;
    if(password===confirmPassword){
      createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
      // Signed up 
      const user = userCredential.user;
      window.location.href="index.html"
          // ...
      })
      .catch((error) => {
          const errorMessage = error.message;
          alert(errorMessage);
          // ..
      });
    }else{
      alert("passwords do not match, please check and eneter again");
    }


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

let fileInput={}
function previewImage(event){
  const img = document.getElementById("preview-image")
  fileInput=event.files[0];
  img.src=URL.createObjectURL(fileInput);

}

async function createListing(event){
  event.preventDefault();
  const productTitle= document.getElementById("product-title").value;
  const productPrice = document.getElementById("product-price").value;
  const productDescription = document.getElementById("product-description").value;
  try{
    const docRef = doc(collection(db,"product-details"));
    const currentUser = auth.currentUser;
    const imageURL = `/images/${docRef.id}/${fileInput.name}`;
    const productDetails = {
      title: productTitle,
      price: productPrice,
      description: productDescription,
      image_url: imageURL,
      user: currentUser.email,
      timestamp: serverTimestamp()
    };
    await setDoc(docRef,productDetails);
    const storageRef = ref(storage,imageURL);
    uploadBytes(storageRef,fileInput).then((snapshot)=>{
      document.getElementById("sell-form").reset();
      document.getElementById("preview-image").src='icons/photo.png';
      alert("Listing Created");
    })
  }catch(error){
    console.log(error);
  }
}

async function getListings(quantity=0){
  console.log("recent listings")
  const listingContainer = document.querySelector(".listing-container");
  let q;
  if(quantity>0){
    q = query(collection(db,"product-details"),orderBy("timestamp", "desc"),limit(quantity));
  }else{
    q = query(collection(db,"product-details"),orderBy("timestamp", "desc"));
  }
  const querySnapshot = await getDocs(q);
  querySnapshot.forEach((doc)=>{
    const imageURL=doc.data().image_url
    console.log(doc.data());
    const href = "product.html"+"?productID="+doc.id
    getDownloadURL(ref(storage,imageURL))
    .then((url) =>{
      listingContainer.insertAdjacentHTML("beforeend",`
    <div class="listing-item">
      <div class="listing-item-image">
        <a href=${href}><img src="${url}" alt=""></a>
      </div>
      <div class="listing-item-text">
        <p class="listing-item-title">${doc.data().title}</p>
        <p class="listing-item-price">${doc.data().price}</p>
      </div>
    </div>
    `)
    }).catch((error)=>{
      console.log(error);
    })
  })
}

async function productDetails() {
  const paramString = window.location.search;
  const searchParams = new URLSearchParams(paramString);
  const docID= searchParams.get("productID");
  const docRef = doc(db,"product-details",docID);
  const productTitle = document.querySelector("#product-details-text h2");
  const productPrice = document.querySelector("#product-details-text h3");
  const listingtDate = document.querySelector("#product-details-text h4");
  const productDescription= document.querySelector("#product-details-text p");
  const productImage = document.querySelector("#product-details-image img");
  try{
    const docSnap = await getDoc(docRef);
    const imageURL = docSnap.data().image_url;
    const time = docSnap.data().timestamp;
    const date = time.toDate().toDateString();
    document.querySelector("title").textContent=docSnap.data().title;
    productTitle.textContent=docSnap.data().title;
    productPrice.textContent="£"+docSnap.data().price;
    listingtDate.textContent="Listing created on: "+date;
    productDescription.textContent=docSnap.data().description;
    getDownloadURL(ref(storage,imageURL))
    .then((url)=>{
      productImage.setAttribute('src',url);
    })
  }catch(error){
    document.querySelector("title").textContent="Product Not Found";
    productTitle.textContent="Product Not Found";
    console.log(error);
  }
    
}
