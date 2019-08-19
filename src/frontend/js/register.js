function register() {
    var name = document.getElementById("username").value;
    var password = document.getElementById("password").value;
    var password2 = document.getElementById("password2").value;
    var dob = document.getElementById("dob").value;
    var height = document.getElementById("height").value;
    var weight = document.getElementById("weight").value;

    if (name == "" || password == "" || dob =="" || weight =="" || height == "") {
        alert("Please fill in all the information.")
    } else if (password != password2) {
        alert("Please input same password.")
    } else {
        postRequest('http://localhost:3000/users/newuser', {
                name: name,
                password: password,
                dob: dob,
                height: height,
                weight: weight,
            })
            .then(response => response.json())
            .then(data => {
                console.log(data)
                if (data.success){
                    console.log("WW", window)
                    window.location.href = "FirstPage.html";
                }

            })
            .catch(error => console.error(error))


    }
}
