function myFunction() {
    var content = document.getElementById('myInput');
    navigator.clipboard.writeText(content)
          .then(() => {
          console.log("Text copied to clipboard...")
      })
          .catch(err => {
          console.log('Something went wrong', err);
      })
  } 