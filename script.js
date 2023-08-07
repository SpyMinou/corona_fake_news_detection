// this function animates the percentage number under the progress bar
function animateValue(id, start, end, duration) {
    var obj = document.getElementsByClassName(id);
    obj[0].innerHTML='0%'
    if (start === end) return;
    var range = end - start;
    var current = start;
    var increment = end > start? 1 : -1;
    var stepTime = Math.abs(Math.floor(duration / range));
    var timer = setInterval(function() {
        current += increment;
        obj[0].innerHTML = current+'%';
        if (current == end) {
            clearInterval(timer);
        }
    }, stepTime);
}

// this function animates the waiting text
function animateWaiting(className){
    waiting='Waiting';
    count=0
    return setInterval(function() {
        if(count>4){
            waiting='Waiting';
            count=0
        }else{
            waiting+='.'
        }
        count++;
        document.getElementsByClassName(className)[0].innerHTML = `<p>${waiting}<p>`;
    }, 200);
}
function submitForm(e){
    e.preventDefault();
    // we hide the progress bar if it's already not hidden and unhide the waiting text
    document.getElementsByClassName('container')[0].hidden=true
    document.getElementsByClassName('waiting')[0].hidden=false

    // animate the waiting text
    var waitingInterval = animateWaiting('waiting')

    // we grab the text and lang from the DOM
    let text=e.target.querySelector('textarea').value
    lang='ar'
    if(document.getElementById('en').checked){
    lang='en'
    }

    // we make HTTP request to the backend api
    fetch(`http://127.0.0.1:5000/test`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,lang
      })
    })
    .then(response => response.json())
    .then(data => {
      // we stop the waiting animation   
      clearInterval(waitingInterval)
      // we hide the waiting text and unhide the progress bar
      document.getElementsByClassName('waiting')[0].hidden=true
      document.getElementsByClassName('waiting')[0].innerHTML=''
      document.getElementsByClassName('container')[0].hidden = false
      
      // we round the percentage we recieved from the backend   
      let per=Math.round(data.percentage)
      
      // we grab the result paragraph so we can change it's color and inner text   
      let result=document.getElementsByClassName('result')
      if(per<30){
          result[0].style.color='red'
          result[0].innerHTML=`it's fake!`
      }
      if(30<=per && per<50){
          result[0].style.color='red'
          result[0].innerHTML=`it's probably fake!`
      }
      if(50<=per && per<80){
          result[0].style.color='#4ade80'
          result[0].innerHTML=`it's probably real!`
      }
      if(per>=80){
          result[0].style.color='#4ade80'
          result[0].innerHTML=`it's real!`
      }
      
      // we set the css variable value to per and start the progress bar animation
      document.documentElement.style.setProperty('--end-width', `${per}%`);
      animateValue('resultPer', 0, per, 1500);
    })
    .catch(error => {
      clearInterval(waitingInterval)
      document.getElementsByClassName('waiting')[0].hidden=true
      document.getElementsByClassName('waiting')[0].innerHTML=''
      console.error('Error:', error);
    });
}

// this function is triggered when the user click on one of the checkboxes 
// it checks if the checkbox is checked and unchecks the other checkbox
function handleCheckBox(e){
    if(e.target.checked){
     id='en'
     if(e.target.id=='en'){
     id='ar'
     }
     document.getElementById(id).checked=false
    }
}