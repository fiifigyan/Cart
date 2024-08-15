let cart = [];

document.addEventListener('DOMContentLoaded', () => {
    fetch('dessert.json')
        .then(response => response.json())
        .then(desserts => {
            const dessertMenu = document.getElementById('dessert-menu');
            desserts.forEach(dessert => {
                const dessertItem = createDessertItem(dessert);
                dessertMenu.appendChild(dessertItem);
            });
        })
        .catch(error => console.error('Error loading desserts:', error));

        // Add event listener for the confirm order button
    document.getElementById('confirm-order-btn').addEventListener('click', confirmOrder);
});

function createDessertItem(dessert) {
    const item = document.createElement('div');
    item.className = 'dessert-item';

    const img = document.createElement('img');
    img.src = dessert.image.thumbnail;
    img.srcset = `${dessert.image.mobile} 375w, ${dessert.image.tablet} 768w, ${dessert.image.desktop} 1440w`;
    img.sizes = "(max-width: 375px) 375px, (max-width: 768px) 384px, 480px";
    img.alt = dessert.name;

    const category = document.createElement('p');
    category.className = 'category';
    category.textContent = dessert.category;

    const name = document.createElement('h3');
    name.textContent = dessert.name;

    const price = document.createElement('p');
    price.className = 'price';
    price.textContent = `$${dessert.price.toFixed(2)}`;

    const quantityControl = document.createElement('div');
    quantityControl.className = 'quantity-control';
    quantityControl.innerHTML = `
        <i class="fa-solid fa-circle-minus quantity-btn minus"></i>
        <span class="quantity">0</span>
        <i class="fa-solid fa-circle-plus quantity-btn plus"></i>
    `;

    const addButton = document.createElement('button');
    addButton.innerHTML = '<i class="fa-solid fa-cart-plus"></i> Add to Cart';
    addButton.className = 'add-to-cart-btn';

    addButton.addEventListener('click', () => {
        const quantitySpan = quantityControl.querySelector('.quantity');
        const currentQuantity = parseInt(quantitySpan.textContent);
        if (currentQuantity === 0) {
            updateQuantity(dessert, quantitySpan, 1);
        } else {
            addToCart(dessert);
        }
        quantityControl.style.display = 'flex';
        addButton.style.display = 'none';
    });

    quantityControl.querySelector('.minus').addEventListener('click', () => 
        updateQuantity(dessert, quantityControl.querySelector('.quantity'), -1));
    quantityControl.querySelector('.plus').addEventListener('click', () => 
        updateQuantity(dessert, quantityControl.querySelector('.quantity'), 1));

    item.appendChild(img);
    item.appendChild(addButton);
    item.appendChild(quantityControl);
    item.appendChild(category);
    item.appendChild(name);
    item.appendChild(price);

    return item;
}

function updateQuantity(dessert, quantitySpan, change) {
    let newQuantity = parseInt(quantitySpan.textContent) + change;
    newQuantity = Math.max(0, newQuantity);

    if (newQuantity === 0) {
        removeFromCart(dessert.name);
        quantitySpan.closest('.dessert-item').querySelector('.add-to-cart-btn').style.display = 'block';
        quantitySpan.closest('.quantity-control').style.display = 'none';
    } else {
        addToCart(dessert, newQuantity - parseInt(quantitySpan.textContent));
    }

    quantitySpan.textContent = newQuantity;
}

function addToCart(dessert, quantityChange = 1) {
    const existingItem = cart.find(item => item.name === dessert.name);
    if (existingItem) {
        existingItem.quantity += quantityChange;
        if (existingItem.quantity <= 0) {
            removeFromCart(dessert.name);
        }
    } else {
        cart.push({ ...dessert, quantity: quantityChange });
    }
    updateCartDisplay();

    // Apply selected class to the dessert item
    const dessertItem = document.querySelector(`.dessert-item h3:contains("${dessert.name}")`).closest('.dessert-item');
    dessertItem.classList.add('selected');
}

function removeFromCart(dessertName) {
    const index = cart.findIndex(item => item.name === dessertName);
    if (index !== -1) {
        cart.splice(index, 1);
        updateCartDisplay();

        // Remove selected class from the dessert item
        const dessertItem = document.querySelector(`.dessert-item h3:contains("${dessertName}")`).closest('.dessert-item');
        dessertItem.classList.remove('selected');

        // Reset the quantity display and show the "Add to Cart" button
        const quantityControl = dessertItem.querySelector('.quantity-control');
        const addButton = dessertItem.querySelector('.add-to-cart-btn');
        const quantitySpan = dessertItem.querySelector('.quantity');
        
        quantitySpan.textContent = '0';
        quantityControl.style.display = 'none';
        addButton.style.display = 'block';
    }
}

function updateCartDisplay() {
    const cartItems = document.getElementById('cart-items');
    const cartCount = document.getElementById('cart-count');
    const cartTotal = document.getElementById('cart-total');
    const carbonDelivery = document.getElementById('delivery');
    const confirmOrderBtn = document.getElementById('confirm-order-btn');

    cartItems.innerHTML = '';
    let total = 0;
    let itemCount = 0;

    cart.forEach(item => {
        const li = document.createElement('li');
        li.innerHTML = `
            ${item.name}<br>
            ${item.quantity}x @$${item.price.toFixed(2)} $${(item.price * item.quantity).toFixed(2)}
            <i onclick="removeFromCart('${item.name}')" class="fa-regular fa-circle-xmark"></i>
        `;
        cartItems.appendChild(li);
        total += item.price * item.quantity;
        itemCount += item.quantity;
    });
    
    cartCount.textContent = itemCount;
    cartTotal.textContent = `Total: $${total.toFixed(2)}`;

    // Enable or disable the confirm order button based on cart contents
    confirmOrderBtn.disabled = itemCount === 0;

    // Update quantity display on dessert items and apply selected class
    document.querySelectorAll('.dessert-item').forEach(item => {
        const name = item.querySelector('h3').textContent;
        const cartItem = cart.find(ci => ci.name === name);
        const quantityControl = item.querySelector('.quantity-control');
        const addButton = item.querySelector('.add-to-cart-btn');
        const quantitySpan = item.querySelector('.quantity');

        if (cartItem) {
            quantitySpan.textContent = cartItem.quantity;
            quantityControl.style.display = 'flex';
            addButton.style.display = 'none';
            item.classList.add('selected');
        } else {
            quantitySpan.textContent = '0';
            quantityControl.style.display = 'none';
            addButton.style.display = 'block';
            item.classList.remove('selected');
        }
    });

    // Update cart visibility
    const cartElement = document.getElementById('cart');
    if (cart.length === 0) {
        cartElement.classList.add('empty');
        cartItems.innerHTML = '<li>Your cart is empty</li>';
    } else {
        cartElement.classList.remove('empty');
    }
}

function confirmOrder() {
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }

    const orderSummary = document.getElementById('orderSummary');
    orderSummary.innerHTML = '';

    cart.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'order-item';
        itemElement.innerHTML = `
            <div class="item-details">
                <div class="item-image" style="background-image: url(${item.image.thumbnail})"></div>
                <div>
                    <div>${item.name}</div>
                    <div>${item.quantity}x @ $${item.price.toFixed(2)}</div>
                </div>
            </div>
            <div>$${(item.price * item.quantity).toFixed(2)}</div>
        `;
        orderSummary.appendChild(itemElement);
    });

    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const orderTotal = document.querySelector('.order-total');
    orderTotal.innerHTML = `
        <span>Order Total</span>
        <span>$${total.toFixed(2)}</span>
    `;

    const modal = document.getElementById('orderModal');
    modal.style.display = 'block';

    const startNewOrderBtn = document.getElementById('startNewOrderBtn');
    startNewOrderBtn.onclick = () => {
        modal.style.display = 'none';
        cart = [];
        updateCartDisplay();
    };

    // Prevent scrolling on the background when modal is open
    document.body.style.overflow = 'hidden';

    // Close the modal if clicked outside of it
    window.onclick = (event) => {
        if (event.target == modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    };
}