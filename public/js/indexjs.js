let menu=document.querySelector('.menu');
let sidebar=document.querySelector('.sidebar');
let maincontent=document.querySelector('.maincontent');

menu.onclick= function(){
    sidebar.classList.toggle('active')
    maincontent.classList.toggle('active')
}


const submenu=document.querySelectorAll('.menuitem');
submenu.forEach(toggle=>{
    toggle.addEventListener('click',function(){
        toggle.nextElementSibling.classList.toggle('show');
       

    })
})

function toggledropdown(){
    document.getElementById('dropdowns').classList.toggle('shows');
}

document.addEventListener('click',function(event){
    if(!event.target.classList.contains('profile')&&!event.target.querySelector('#dropdowns')){
        document.getElementById('dropdown').classList.remove('shows');
    }
});