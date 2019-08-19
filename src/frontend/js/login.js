function start()  {
  var name = document.getElementById("username").value;
  var password = document.getElementById("password").value;
  var errorArea = document.getElementById("error-message");

  if (name == "" || password == "") {
      alert ("Please input your username and password.")
  } else {
    postRequest('http://localhost:3000/users/login', {name: name, password:password})
    .then(response => response.json())
    .then(data => {
      if(data.success) {
        localStorage.setItem('user', JSON.stringify({name: name, password:password}))
        localStorage.setItem("name", name)
        window.location.href = "profile.html";
      } else {
        errorArea.innerText = data.error
      }

    })
    .catch(error => console.error(error))
    //
  }
}
