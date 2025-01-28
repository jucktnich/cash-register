const items = [
    { id: 'fries', name: 'Pommes', price: 500 },
    { id: 'coke', name: 'Cola', price: 250 },
    { id: 'burger', name: 'Burger', price: 800 },
    { id: 'ice-cream', name: 'Eis', price: 400 }
];

const buttonContainer = document.getElementById('button-container');
const itemList = document.getElementById('item-list');
const totalPriceElement = document.getElementById('total-price');
const resetButton = document.getElementById('reset-button');
const finishButton = document.getElementById('finish-button');
const editControls = document.getElementById('edit-controls')
const incrementButton = document.getElementById('increment-button');
const decrementButton = document.getElementById('decrement-button');

let cart = [];
let selectedItemIndex = null;

// Create buttons for each item
items.forEach(item => {
    const button = document.createElement('button');
    button.textContent = `${item.name} - ${(item.price/100).toFixed(2)}€`;
    button.addEventListener('click', () => addItemToCart(item));
    buttonContainer.appendChild(button);
});

function addItemToCart(item) {
    const cartItemIndex = cart.findIndex(cartItem => cartItem.id === item.id);

    if (cartItemIndex > -1) {
        // If item exists in cart, increment the quantity and move it to the end
        cart[cartItemIndex].quantity++;
        selectedItemIndex = cartItemIndex;
        /*const cartItem = cart.splice(cartItemIndex, 1)[0];
        cart.push(cartItem);*/
    } else {
        // If item does not exist in cart, add it
        cart.push({ ...item, quantity: 1 });
        selectedItemIndex = cart.length - 1;
    }

    //selectedItemIndex = cart.length - 1;

    updateCartDisplay();
}

function updateCartDisplay() {
    itemList.innerHTML = '<h3>Warenkorb:</h3>'; // Reset the item list display
    editControls.style.display = 'flex';

    cart.forEach((cartItem, index) => {
        const itemElement = document.createElement('div');
        itemElement.classList.add('item');
        if (selectedItemIndex === index) {
            itemElement.classList.add('selected');
        }
        itemElement.innerHTML = `<span>${cartItem.quantity}x ${cartItem.name}</span><span>${(cartItem.price/100 * cartItem.quantity).toFixed(2)}€</span>`;
        itemElement.addEventListener('click', () => {
            selectedItemIndex = index;
            updateCartDisplay();
        });

        itemList.appendChild(itemElement);
    });

    if (cart.length === 0) {
        editControls.style.display = 'none';
        itemList.innerHTML = '<h3>Warenkorb:</h3><span class="empty-cart">Warenkorb ist leer</span>'
    }

    // Update the total price
    const total = cart.reduce((sum, cartItem) => sum + cartItem.price * cartItem.quantity, 0);
    totalPriceElement.textContent = `Gesamt: ${(total/100).toFixed(2)}€`;
}

incrementButton.addEventListener('click', () => {
    if (selectedItemIndex !== null) {
        cart[selectedItemIndex].quantity++;
        updateCartDisplay();
    }
});

decrementButton.addEventListener('click', () => {
    if (selectedItemIndex !== null) {
        const selectedItem = cart[selectedItemIndex];
        if (selectedItem.quantity > 1) {
            selectedItem.quantity--;
        } else {
            cart.splice(selectedItemIndex, 1);
            selectedItemIndex = null;
        }
        updateCartDisplay();
    }
});

resetButton.addEventListener('click', () => {
    if (confirm('Zurücksetzen?')) {
        cart = [];
        selectedItemIndex = null;
        updateCartDisplay();
    }
});

finishButton.addEventListener('click', () => {
    if (confirm('Verkauf abschließen?')) {
        cart = [];
        selectedItemIndex = null;
        updateCartDisplay();
    }
});

updateCartDisplay();