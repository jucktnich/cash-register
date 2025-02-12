import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabaseUrl = 'https://supabase.abi-marbach.de'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ewogICJyb2xlIjogImFub24iLAogICJpc3MiOiAic3VwYWJhc2UiLAogICJpYXQiOiAxNzM4NjIzNjAwLAogICJleHAiOiAxODk2MzkwMDAwCn0.Q6MJno9HxtTxOOkajZ72SrYRRJoEtwupgMBTKJjPJUo'

const supabase = await createClient(supabaseUrl, supabaseKey);

let userID, items;

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

function addItemToCart(item) {
    if (!item.id) item = items.filter(curItem => curItem.id.includes(item))[0];
    const cartItemIndex = cart.findIndex(cartItem => cartItem.id === item.id);

    if (cartItemIndex > -1) {
        // If item exists in cart, increment the quantity and move it to the end
        cart[cartItemIndex].quantity++;
        selectedItemIndex = cartItemIndex;
    } else {
        // If item does not exist in cart, add it
        cart.push({ ...item, quantity: 1 });
        selectedItemIndex = cart.length - 1;
    }

    if(item.includes) {
        item.includes.forEach(addItemToCart);
        selectedItemIndex -= item.includes.length;
    }

    updateCartDisplay();
}

function deleteItemFromCart(item) {
    if (!item.id) item = items.filter(curItem => curItem.id.includes(item))[0];
    const cartItemIndex = cart.findIndex(cartItem => cartItem.id === item.id);

    const selectedItem = cart[cartItemIndex];
    if (selectedItem.quantity > 1) {
        selectedItem.quantity--;
    } else {
        cart.splice(cartItemIndex, 1);
        selectedItemIndex = null;
    }

    if(item.includes) item.includes.forEach(deleteItemFromCart);

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
        itemElement.innerHTML = `<span>${cartItem.quantity}x ${cartItem.name}</span><span>${(cartItem.price / 100 * cartItem.quantity).toFixed(2)}€</span>`;
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
    totalPriceElement.textContent = `Gesamt: ${(total / 100).toFixed(2)}€`;
}

incrementButton.addEventListener('click', () => {
    if (selectedItemIndex !== null) {
        addItemToCart(cart[selectedItemIndex].id)
    }
});

decrementButton.addEventListener('click', () => {
    if (selectedItemIndex !== null) {
        deleteItemFromCart(cart[selectedItemIndex])
    }
});

resetButton.addEventListener('click', () => {
    if (confirm('Zurücksetzen?')) {
        cart = [];
        selectedItemIndex = null;
        updateCartDisplay();
    }
});

finishButton.addEventListener('click', async () => {
    if (confirm('Verkauf abschließen?')) {
        const { error } = await supabase
            .from('sales')
            .insert({ created_by: userID, time_of_sale: new Date(), products: cart })
        if (error) {
            alert('Verkauf konnte nicht abgeschlossen werden, versuche es erneut');
        } else {
            cart = [];
            selectedItemIndex = null;
            updateCartDisplay();
        }
    }
});


document.getElementById("login-button").addEventListener('click', async () => {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const { data: user } = await supabase.auth.signInWithPassword({
        email: username + '@abi-marbach.de',
        password: password,
    });

    userID = user.user.id;

    const { data: itemsDownload } = await supabase
        .from('items')
        .select()

    items = itemsDownload;

    // Create buttons for each item
    items.forEach(item => {
        const button = document.createElement('button');
        button.textContent = `${item.name} | ${(item.price / 100).toFixed(2)}€`;
        button.addEventListener('click', () => addItemToCart(item));
        buttonContainer.appendChild(button);
    });

    updateCartDisplay();
    document.getElementById('login-container').style.display = 'none';
    document.getElementById('cash-register').style.display = 'block';
})