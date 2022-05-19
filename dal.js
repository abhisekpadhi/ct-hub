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

const addUser = async ({phone}) => {
    const existing = await getUserByPhone(phone);
    if (existing === undefined) {
        await run('INSERT INTO userAccount(phone) VALUES($phone)', {$phone: phone});
        console.log(`new userAccount created for ${phone}`);
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

const addUserTraits = async ({traits, viewerId}) => {
    await run('INSERT INTO userTraits(userId, traits, viewerId) VALUES($userId, $traits, $viewerId)', {
        $userId: '',
        $traits: traits,
        $viewerId: viewerId,
    });
}

const associateUserIdWithViewerId = async (viewerId, userId) => {
    await run('UPDATE userTraits set userId = $userId where viewerId = $viewerId', {
        $viewerId: viewerId
    });
}
