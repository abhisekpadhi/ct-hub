const {
    all,
    get,
    run
} = require('./db-utils')

const getUserByPhone = async (phone) => {
    return await get('SELECT * FROM userAccount WHERE phone = $phone', {
        $phone: phone,
    });
}

const addUser = async ({phone, rapydCusId, custName}) => {
    const existing = await getUserByPhone(phone);
    if (existing === undefined) {
        await run('INSERT INTO userAccount(phone, rapydCusId, custName) VALUES($phone, $rapydCusId, $custName)', {
            $phone: phone,
            $rapydCusId: rapydCusId,
            $custName: custName,
        });
        console.log(`new userAccount created for ${phone} with rapydCusId ${rapydCusId}`);
    } else {
        console.log(`userAccount with ${phone} exists`);
    }
}

const addCart = async ({cart, cartItems}) => {
    await run('INSERT INTO cart(userId, merchant, cartId, total) VALUES($userid, $merchant, $cartId, $total)', {
        $userId: cart.userId,
        $merchant: cart.merchant,
        $cartId: cart.cartId,
        $total: cart.total,
    });
    for (const cartItem in cartItems) {
        await run(
            'INSERT INTO cartItems(cartId, productName, qty, price) VALUES($cartId, $productName, $qty, $price)',
            {
                $cartId: cart.cartId,
                $productName: cartItem.productName,
                $qty: cartItem.qty,
                $price: cartItem.price,
            });
    }
}

const getUserTraitsByUserId = async (userId) => {
    await get('SELECT * FROM userTraits WHERE userId = $userId', {
        $userId: userId,
    });
}
const getUserTraitsByViewerId = async (viewerId) => {
    await get('SELECT * FROM userTraits WHERE viewerId = $viewerId', {
        $viewerId: viewerId
    });
}

const addUserTraitsForViewer = async ({traits, viewerId}) => {
    await run('INSERT INTO userTraits(userId, traits, viewerId) VALUES($userId, $traits, $viewerId)', {
        $userId: '',
        $traits: traits,
        $viewerId: viewerId,
    });
}

const updateUserTraitsByViewer = async ({traits, viewerId}) => {
    await run('UPDATE userTraits set traits = $traits where viewerId = $viewerId', {
        $traits: traits,
        $viewerId: viewerId,
    });
}

const addOrUpdateTraits = async ({traits, viewerId}) => {
    const existingTraits = await getUserTraitsByViewerId(viewerId);
    console.log(`existing traits: ${JSON.stringify(existingTraits)}`);
    if (existingTraits === undefined) {
        // create new record
        const updated = [traits];
        await addUserTraitsForViewer({traits: JSON.stringify(updated), viewerId})
        console.log(`created new traits for ${viewerId}: ${JSON.stringify(updated)}`);
    } else {
        // update record append add trait to list
        const updted = JSON.parse(existingTraits.traits);
        if (updted.indexOf(traits) === -1) {
            updted.push(traits);
        }
        await updateUserTraitsByViewer({traits: updted, viewerId});
        console.log(`traits updated for viewer ${viewerId}: ${JSON.stringify(updted)}`);
    }
};

const associateTraitUserIdWithViewerId = async (viewerId, userId) => {
    await run('UPDATE userTraits set userId = $userId where viewerId = $viewerId', {
        $viewerId: viewerId,
        $userId: userId,
    });
    console.log(`userId ${userId} associated with viewer ${viewerId}`);
}

const getCart = async (userId) => {
    return await get('SELECT * FROM cart WHERE userId = $userId', { $userId: userId });
}

const associateCheckoutIdWithCart = async (cartId, rapydCheckoutId) => {
    await run('UPDATE cart SET rapydCheckoutId = $rapydCheckoutId WHERE cartId = $cartId', {
        $rapydCheckoutId: rapydCheckoutId,
        $cartId: cartId
    });
    console.log(`associated cart ${cartId} with rapydCheckoutId ${rapydCheckoutId}`);
}

const getCartWithItemsByRapydCheckoutId = async (rapydCheckoutId) => {
    const cart =  await get('SELECT * FROM cart WHERE rapydCheckoutId = $rapydCheckoutId', {
        $rapydCheckoutId: rapydCheckoutId
    });
    if (cart !== undefined) {
        const items = await all('SELECT * FROM cartItems WHERE cartId = $cartId', { $cartId: cart.cartId });
        return {cart, items};
    } else {
        return null
    }
}

module.exports = {
    addOrUpdateTraits,
    associateTraitUserIdWithViewerId,
    getCart,
    getUserByPhone,
    addUser,
    associateCheckoutIdWithCart,
    getCartWithItemsByRapydCheckoutId
}
