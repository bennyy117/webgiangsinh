import { initializeApp } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.13.0/firebase-analytics.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-auth.js";
import { getFirestore, collection, getDocs, addDoc, serverTimestamp, deleteDoc, doc, query, where, getDoc } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getMetadata, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.10.0/firebase-storage.js";


const firebaseConfig = {
  apiKey: "AIzaSyD4Q0jMGzhpELAXHcB-r33mfLNOV8u-ehk",
  authDomain: "prjck3.firebaseapp.com",
  projectId: "prjck3",
  storageBucket: "prjck3.appspot.com",
  messagingSenderId: "890849333233",
  appId: "1:890849333233:web:70b46c4721ea9e149d3e50",
  measurementId: "G-3RZ5SBDVWW"
};

class Firebase {
  constructor() {
    this.app = initializeApp(firebaseConfig);
    this.auth = getAuth(this.app);
    this.db = getFirestore(this.app);
    this.storage = getStorage(this.app);
  }

  signup(email, password) {
    createUserWithEmailAndPassword(this.auth, email, password)
      .then((userCredential) => {
        // Signed in 
        const user = userCredential.user;
        alert("Đăng kí thành công");
        window.location.href = "./signin.html"
        // ...
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        // ..
        alert(errorMessage);
      });
  }

  signin(email, password) {
    signInWithEmailAndPassword(this.auth, email, password)
      .then((userCredential) => {
        // Signed in 
        const user = userCredential.user;
        alert("Đăng nhập thành công");
        const { email, uid, accessToken } = user;
        localStorage.setItem('user', JSON.stringify({ email, uid, accessToken }))
        window.location.href = "../index.html"
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
      });
  }

  async readTodos() {
    const querySnapshot = await getDocs(collection(this.db, "todos"));
    const data = []
    querySnapshot.forEach((doc) => {
      data.push({ id: doc.id, name: doc.data().name, price: doc.data().price, uploadURL: doc.data().uploadURL });
    });
    return data;
  }

  async addTodo(name, price, uploadURL) {
    try {
      const docRef = await addDoc(collection(this.db, "todos"), {
        name, price, uploadURL,
        createdAt: serverTimestamp()
      });
      console.log("Document written with ID: ", docRef.id);
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  }

  async deleteTodo(id, todo) {
    try {
      await deleteDoc(doc(this.db, "todos", id));
      window.location.reload()
    }
    catch (err) {
      console.log(err)
    }
  }

  async uploadFile(file) {
    try {
      let storageRef = ref(this.storage, `imgs/${file.name}`);
      let snapshot = await uploadBytes(storageRef, file)
      let url = await getDownloadURL(storageRef)
      return url

    } catch (error) {
      console.log(error)
      return null
    }
  }

  async readCart() {
    try {
      const uid = JSON.parse(localStorage.getItem("user")).uid
      const q = query(collection(this.db, "cart"), where("userId", "==", uid));
      // const carts = []; 
      const listPid = new Array();
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        listPid.push({pid: doc.data().productId, quantity: doc.data().quantity})
      })
      const carts = await Promise.all(listPid.map(async ({pid, quantity}) => ({quantity, ...(await this.readProductbyId(pid))})))
      
      return carts
  } catch (error) {
      console.log(error)
      return null
    }
  }

  async readProductbyId(id) {
    try {
      const docRef = doc(this.db, "todos", id.replaceAll(" ", ""));
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data();
      } else {
        // doc.data() will be undefined in this case
        return null;
      }
    } catch (error) {
      console.log(error)
      return null
    }
  }
  async addToCart(PId, quantity, UId) {
    try {
      const docRef = await addDoc(collection(this.db, "cart"), {
        productId: PId,
        quantity: quantity,
        userId: UId,
        createdAt: serverTimestamp()
      });
      alert("Thêm sản phẩm thành công!")
      window.location.reload();
    } catch (e) {
    }
  }
}

export default Firebase;
