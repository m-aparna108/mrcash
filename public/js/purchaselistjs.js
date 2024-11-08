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


const decreasequant=document.querySelectorAll(".decrease");
const increasequant=document.querySelectorAll(".increase");
const quantityinput=document.getElementById('quantity');/* either remove this and add it on the function*/
decreasequant.forEach((button)=>
    {
        button.addEventListener('click',(e)=>{
            
            const currentquantity=parseInt(quantityinput.value);
            if(currentquantity>1){
                quantityinput.value=currentquantity-1;
            }
        });
    });


increasequant.forEach((button)=>
    {
        button.addEventListener('click',(e)=>{
                
            const currentquantity=parseInt(quantityinput.value);
            quantityinput.value=currentquantity+1;
        })
    });

//pop up card for filter button
    document.addEventListener('DOMContentLoaded', () => {
        const filterButton = document.getElementById('filterButton');
        const filterPopup = document.getElementById('filterPopup');
        const closePopupButton = document.getElementById('closePopup');
        const filterForm = document.getElementById('filterForm');
    
        // Toggle filter popup visibility
        filterButton.addEventListener('click', () => {
            filterPopup.style.display = filterPopup.style.display === 'none' ? 'block' : 'none';
        });
    
        // Close the popup
        closePopupButton.addEventListener('click', () => {
            filterPopup.style.display = 'none';
        });
        //-----------------------------------------------------------------------------------------//
        // Handle filter submission (you may want to implement filtering logic here)
        /*filterForm.addEventListener('submit', (event) => {
            event.preventDefault();
            // Get filter values
            const orderDate = document.getElementById('orderDate').value;
            const orderId = document.getElementById('orderId').value;
            const supplier = document.getElementById('supplier').value;
            const deliveryStatus = document.getElementById('deliveryStatus').value;
    
            // Implement your filtering logic here (e.g., make an AJAX call to fetch filtered data)
            console.log('Filters:', { orderDate, orderId, supplier, deliveryStatus });
    
            // Close the popup after submission
            filterPopup.style.display = 'none';
        });*/


        filterForm.addEventListener('submit', (event) => {
            event.preventDefault();
            
            // Get filter values
            const orderDate = document.getElementById('orderDate').value;
            const orderId = document.getElementById('orderId').value;
            const supplier = document.getElementById('supplier').value;
            const deliveryStatus = document.getElementById('deliveryStatus').value;
        
            // Build query string
            const queryParams = new URLSearchParams();
            if (orderDate) queryParams.append('orderDate', orderDate);
            if (orderId) queryParams.append('orderId', orderId);
            if (supplier) queryParams.append('supplier', supplier);
            if (deliveryStatus) queryParams.append('deliveryStatus', deliveryStatus);
        
            // Redirect to the same route with query parameters
            window.location.href = `/purchase?${queryParams.toString()}`;
        });
        
    });
    //--------------------------------------------------------------------------------------//
    