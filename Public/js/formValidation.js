document.getElementById("furnitureForm").addEventListener("submit", function (e) {
  e.preventDefault();
  let isValid = true;
  const fields = ["name", "type", "price", "description"];

  fields.forEach((field) => {
    const input = document.getElementById(field);
    const error = input.nextElementSibling;
    if (!input.value.trim()) {
      error.textContent = "This field is required";
      isValid = false;
    } else {
      error.textContent = "";
    }

    if (field === "price" && input.value && input.value <= 0) {
      error.textContent = "Price must be greater than 0";
      isValid = false;
    }
  });

  if (isValid) {
    alert("Form submitted successfully!");
    e.target.reset();
  }
});

let logIn =function(){
    let user = document.getElementById("username").value
    let password= document.getElementById("password").value
    let message = document.getElementById("message")
    // correct credentials
    let correctUser="admin"
    let correctPassword="1234"

    if (user===correctUser &&password===correctPassword){
message.textContent="login is successful,welcome"+user
message.style.color="green"
    } else{
      message.textContent="invalid username or password"
message.style.color="red"  
    }

}

document.getElementById("btn").addEventListener("click",logIn)//activated
