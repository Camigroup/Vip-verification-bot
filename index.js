const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const fs = require('fs');


// Replace with your BotFather token
const token = process.env.BOT_TOKEN;
const VIP_GROUP_ID = -1003985904777; // replace with your group ID
const COURSE_GROUP_ID = -1002586163214; // replace with your course group ID
const ADMIN_GROUP_ID = -1004307830376;
const ADMINS = [
    5324276529 // your Telegram ID
];

const bot = new TelegramBot(token, {
    polling: true
});

bot.on('message', (msg) => {
    console.log("=================================");
    console.log("PAYMENT GROUP ID:", msg.chat.id);
    console.log("CHAT TYPE:", msg.chat.type);
    console.log("CHAT TITLE:", msg.chat.title);
    console.log("=================================");
});


bot.on('message', (msg) => {
    console.log("CHAT ID:", msg.chat.id);
    console.log("CHAT TYPE:", msg.chat.type);
});


const awaitingProof = {};
const paymentRequests = {};
const pendingPayments = {};
const awaitingEmail = {};
const awaitingBroadcast = {};
let subscriptions = [];

try {
    subscriptions = JSON.parse(
        fs.readFileSync("subscriptions.json", "utf8")
    );
} catch (err) {
    subscriptions = [];
}

let verifiedEmails = [];

try {

    verifiedEmails = JSON.parse(
        fs.readFileSync("verifiedEmails.json", "utf8")
    );

} catch (err) {

    verifiedEmails = [];

}

console.log(' Bot is running...');
checkExpiredSubscriptions();
checkRenewalReminders();



// START COMMAND
bot.onText(/\/start/, (msg) => {

    const chatId = msg.chat.id;

    bot.sendMessage(
        chatId,
        `👋 Welcome to CamiForex Trade Hub, i am your personal assistant.

We're glad to have you here.

Before we continue, tell us a little about your trading experience.`,
        {
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: '✅ Yes, I Have Traded Before',
                            callback_data: 'experienced'
                        }
                    ],
                    [
                        {
                            text: "📚 No, I'm New To Trading",
                            callback_data: 'beginner'
                        }
                    ]
                ]
            }
        }
    );
});

bot.onText(/\/admin/, async (msg) => {

    const chatId = msg.chat.id;

    if (!ADMINS.includes(chatId)) {

        return bot.sendMessage(
            chatId,
            "❌ Unauthorized"
        );

    }

    await bot.sendMessage(
        chatId,
        "🛠 ADMIN CONTROL PANEL",
        {
            reply_markup: {
                inline_keyboard: [

                    [
                        {
                            text: "📊 Statistics",
                            callback_data: "admin_stats"
                        }
                    ],

                    [
                        {
                            text: "👥 Active Subscribers",
                            callback_data: "admin_subscribers"
                        }
                    ],

                    [
                        {
                            text: "💳 Pending Payments",
                            callback_data: "admin_pending"
                        }
                    ],

                    [
                        {
                            text: "📢 Broadcast",
                            callback_data: "admin_broadcast"
                        }
                    ]

                ]
            }
        }
    );

});

// BUTTON HANDLER
bot.on('callback_query', async (query) => {

    const chatId = query.message.chat.id;
    const data = query.data;

    try {

        // EXPERIENCED TRADER
        if (data === 'experienced') {

            await bot.sendMessage(
                chatId,
                `🔥 Great!

Since you already have trading experience, we'll help you take your trading to the next level.

Choose an option below.`,
                {
                    reply_markup: {
                        inline_keyboard: [
                            [
 { text:'⭐ Join Free VIP', callback_data:'free_vip' }
],
[
 { text:'💎 Paid VIP Access', callback_data:'vip' }
],
                            [{ text: '🎓 Mentorship', callback_data: 'mentorship' }],
                            [{ text: '📖 Learn Forex (Free)', callback_data: 'learn' }],
                            [{ text: '💡 Why Join VIP?', callback_data: 'whyvip' }],
                            [{ text: '📞 Contact Admin', callback_data: 'contact' }],
                        ]
                    }
                }
            );
        }

        // BEGINNER TRADER
        else if (data === 'beginner') {

            await bot.sendMessage(
                chatId,
                `📚 Welcome to CamiForex Academy.

Don't worry if you're just getting started.

Choose an option below.`,
                {
                    reply_markup: {
                        inline_keyboard: [
                            [
 { text:'⭐ Join Free VIP', callback_data:'free_vip' }
],
[
 { text:'💎 VIP Access', callback_data:'vip' }
],
                            [{ text: '🎓 Mentorship', callback_data: 'mentorship' }],
                            [{ text: '📖 Learn Forex (Free)', callback_data: 'learn' }],
                            [{ text: '💡 Why Join VIP?', callback_data: 'whyvip' }],
                            [{ text: '📞 Contact Admin', callback_data: 'contact' }]
                        ]
                    }
                }
            );
        }

else if (data === 'free_vip') {

    await bot.sendMessage(
        chatId,
        `💎 EXNESS VIP SERVICE

To join our FREE VIP community, you need an Exness account registered under our partner link.

Do you already have an Exness account?

Choose an option below.`,
        {
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: '✅ Yes, I Have an Exness Account',
                            callback_data: 'vip_existing_account'
                        }
                    ],
                    [
                        {
                            text: "🆕 No, I'm New to Exness",
                            callback_data: 'vip_new_account'
                        }
                    ],
                    [
                        {
                            text: '⬅ Back',
                            callback_data: 'back_main'
                        }
                    ]
                ]
            }
        }
    );

}

else if (data === 'vip_existing_account') {

        await bot.sendMessage(
        chatId,
        `💎 EXNESS ACCOUNT

If you already have an Exness account, you can verify the email associated with your account.

If your Exness account is already under our partner link, simply verify your account below.

If your account is NOT under our partner link, you can switch your partner first.

⚠️ Note: An account with zero deposits/trades will not pass verification.

Choose an option below.`,
        {
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: '🔄 Switch Partner',
                            callback_data: 'vip_switch_partner'
                        }
                    ],
                    [
                        {
                            text: '📧 Verify Exness Account',
                            callback_data: 'vip_verify_existing'
                        }
                    ],
                    [
                        {
                            text: '⬅ Back',
                            callback_data: 'free_vip'
                        }
                    ]
                ]
            }
        }
    );

}

else if (data === 'vip_switch_partner') {

    await bot.sendMessage(
        chatId,
        `🔄 CHANGE YOUR EXNESS PARTNER

If your Exness account is not currently under our partner link, follow the steps below to change your partner.

1️⃣ Log in to your Exness account.

2️⃣ Go to your Profile.

3️⃣ Open Live Chat with Exness Support.

4️⃣ Type:

"Change partner"

5️⃣ Click the link that Exness Support sends you.

6️⃣ Select "Rebate" as the reason.

7️⃣ Paste our Exness partner link below:

🔗 https://one.exnessonelink.com/a/895rrfumo2

After completing the partner change, return here and verify your Exness account email.`,
        {
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: '🔗 Open Exness Support',
                            url: 'https://www.exness.com/support/'
                        }
                    ],
                    [
                        {
                            text: '📧 Verify Exness Account',
                            callback_data: 'vip_verify_existing'
                        }
                    ],
                    [
                        {
                            text: '⬅ Back',
                            callback_data: 'vip_existing_account'
                        }
                    ]
                ]
            }
        }
    );

}

else if (data === 'vip_new_account') {

    await bot.sendMessage(
        chatId,
        `🆕 CREATE YOUR EXNESS ACCOUNT

You don't have an Exness account yet.

To access our FREE VIP, you need to:

1️⃣ Create your Exness account using our official partner link below
2️⃣ Deposit funds and/or start trading on that account
3️⃣ Return here and verify your account

⚠️ Note: An account with zero deposits/trades will not pass verification.`,
        {
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: '🔗 Create Exness Account',
                            url: 'https://one.exnessonelink.com/a/895rrfumo2'
                        }
                    ],
                    [
                        {
                            text: '✅ Account Created — Verify Now',
                            callback_data: 'vip_verify_new'
                        }
                    ],
                    [
                        {
                            text: '⬅ Back',
                            callback_data: 'free_vip'
                        }
                    ]
                ]
            }
        }
    );

}

else if (data === 'vip_verify_new') {

    awaitingEmail[chatId] = "vip";

    await bot.sendMessage(
        chatId,
        `📧 FREE VIP VERIFICATION

Please send the email you used to register your Exness account through our partner link.

Example:

name@gmail.com`,
        {
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: '⬅ Back',
                            callback_data: 'vip_new_account'
                        }
                    ]
                ]
            }
        }
    );

}


else if (data === 'vip_verify_existing') {

    awaitingEmail[chatId] = "vip";

    await bot.sendMessage(
        chatId,
        `📧 FREE VIP VERIFICATION

Please send the email associated with your Exness account.

Example:

name@gmail.com`,
        {
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: '⬅ Back',
                            callback_data: 'vip_existing_account'
                        }
                    ]
                ]
            }
        }
    );

}

else if (data === 'course_verification_has_account') {

    await bot.sendMessage(
        chatId,
        `🔄 CHANGE YOUR EXNESS PARTNER

If you already have an Exness account but it is not currently under our partner link, you may need to change your partner.

Follow these steps:

1️⃣ Log in to your Exness account.

2️⃣ Go to your Profile.

3️⃣ Open Live Chat with Exness Support.

4️⃣ Type:

"Change partner"

5️⃣ Click the link that Exness Support sends you.

6️⃣ Select "Rebate" as the reason.

7️⃣ Paste our Exness partner link below:

🔗 https://one.exnessonelink.com/a/895rrfumo2

After completing the partner change, return here and verify your Exness account email.`,
        {
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: '🔗 Open Exness Live Chat',
                            url: 'https://www.exness.com/support/'
                        }
                    ],
                    [
                        {
                            text: '📧 Verify Course Account',
                            callback_data: 'course_verify_existing'
                        }
                    ],
                    [
                        {
                            text: '⬅ Back',
                            callback_data: 'course_existing_account'
                        }
                    ]
                ]
            }
        }
    );

}

else if (data === 'course_verification_no_account') {

    await bot.sendMessage(
        chatId,
        `🆕 CREATE YOUR EXNESS ACCOUNT

It looks like you don't have an Exness account with this email.

To access our FREE Forex Course, you need to create an Exness account using our official partner link.

After creating your account, return here and verify your registered email.`,
        {
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: '🔗 Create Exness Account',
                            url: 'https://one.exnessonelink.com/a/895rrfumo2'
                        }
                    ],
                    [
                        {
                            text: '✅ Account Created — Verify Now',
                            callback_data: 'course_verify_new'
                        }
                    ],
                    [
                        {
                            text: '⬅ Back',
                            callback_data: 'course_existing_account'
                        }
                    ]
                ]
            }
        }
    );

}

else if (data === 'verification_has_account') {

    await bot.sendMessage(
        chatId,
        `🔄 CHANGE YOUR EXNESS PARTNER

If you already have an Exness account but the email could not be verified under our partner link, you may need to change your partner.

Follow these steps:

1️⃣ Log in to your Exness account.

2️⃣ Go to your Profile.

3️⃣ Open Live Chat with Exness Support.

4️⃣ Type:
"Change partner"

5️⃣ Click the link that Exness Support sends you.

6️⃣ Select "Rebate" as the reason.

7️⃣ Paste our Exness partner link below:

🔗 https://one.exnessonelink.com/a/895rrfumo2

After completing the partner change, return here and verify your Exness account email.`,
        {
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: '🔗 Open Exness Live chat',
                            url: 'https://www.exness.com/support/'
                        }
                    ],
                    [
                        {
                            text: '📧 Verify Exness Account',
                            callback_data: 'vip_verify_existing'
                        }
                    ],
                    [
                        {
                            text: '⬅ Back',
                            callback_data: 'vip_existing_account'
                        }
                    ]
                ]
            }
        }
    );

}

else if (data === 'verification_no_account') {

    await bot.sendMessage(
        chatId,
        `🆕 CREATE YOUR EXNESS ACCOUNT

It looks like you don't have an Exness account with this email.

To access our FREE VIP, you need to create an Exness account using our official partner link.

After creating your account, return here and verify the email you registered with.`,
        {
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: '🔗 Create Exness Account',
                            url: 'https://one.exnessonelink.com/a/895rrfumo2'
                        }
                    ],
                    [
                        {
                            text: '✅ Account Created — Verify Now',
                            callback_data: 'vip_verify_new'
                        }
                    ],
                    [
                        {
                            text: '⬅ Back',
                            callback_data: 'verification_failed'
                        }
                    ]
                ]
            }
        }
    );

}

else if (data === 'verification_different_email') {

    awaitingEmail[chatId] = "vip";

    await bot.sendMessage(
        chatId,
        `📧 FREE VIP VERIFICATION

Please send the email you used to register your Exness account.

If you entered the wrong email previously, you can enter the correct one now.

Example:

name@gmail.com`,
        {
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: '⬅ Back',
                            callback_data: 'back_main'
                        }
                    ]
                ]
            }
        }
    );

}

else if (data === 'course_verification_different_email') {

    awaitingEmail[chatId] = "course";

    await bot.sendMessage(
        chatId,
        `📧 COURSE VERIFICATION

Please send the email associated with your Exness account.

If you entered the wrong email previously, you can enter the correct one now.

Example:

name@gmail.com`,
        {
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: '⬅ Back',
                            callback_data: 'learn'
                        }
                    ]
                ]
            }
        }
    );

}

else if (data === 'verification_failed') {

    await bot.sendMessage(
        chatId,
        `❌ WE COULDN'T VERIFY YOUR EMAIL

This email is not currently associated with our Exness partner link.

Do you have an Exness account registered with this email?

Choose an option below.`,
        {
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: "✅ Yes, I Have an Exness Account",
                            callback_data: "verification_has_account"
                        }
                    ],
                    [
                        {
                            text: "🆕 No, I Don't Have an Account",
                            callback_data: "verification_no_account"
                        }
                    ],
                    [
                        {
                            text: "📧 Try a Different Email",
                            callback_data: "verification_different_email"
                        }
                    ],
                    [
                        {
                            text: "🏠 Main Menu",
                            callback_data: "back_main"
                        }
                    ]
                ]
            }
        }
    );

}

        // VIP MENU
        else if (data === 'vip') {

    await bot.sendMessage(
        chatId,
        `💎 VIP ACCESS

Get lifetime access to our Premium VIP community.

Choose the plan below.`,
        {
            reply_markup: {
                inline_keyboard: [
                    [{ text: '🚀 VIP Lifetime — $100', callback_data: 'lifetime' }],
                    [{ text: '⬅ Back', callback_data: 'back_main' }]
                ]
            }
        }
    );
}

        // MONTHLY VIP
        else if (data === 'monthly') {

       pendingPayments[chatId] = {
    package: "VIP Monthly"
};

paymentRequests[chatId] = {
    package: "VIP Monthly",
    amount: 50
};

awaitingProof[chatId] = true;


    await bot.sendMessage(
        chatId,
        `📅 VIP MONTHLY

Price: $50 (30,000 FCFA)

Payment Method:
USDT (TRC20)  &  MTN Mobile Money 

Wallet Address:


MTN Mobile Money 



After payment, send your screenshot to the admin for confirmation.
Through the button below.`,
        {
            reply_markup: {
                inline_keyboard: [
                   [{ text: '📤 Upload Payment Proof', callback_data: 'upload_proof' }],
                    [{ text: '⬅ Back', callback_data: 'vip' }]
                ]
            }
        }
    );
}

        // YEARLY VIP
        else if (data === 'yearly') {

pendingPayments[chatId] = {
    package: "VIP Yearly"
};

paymentRequests[chatId] = {
    package: "VIP Yearly",
    amount: 300
};

awaitingProof[chatId] = true;
    await bot.sendMessage(
        chatId,
        `👑 VIP YEARLY

Price: $300 (180,000 FCFA)

Payment Method:
USDT (TRC20)  &  MTN Mobile Money 

Wallet Address:


MTN Mobile Money 



After payment, send your screenshot to the admin for confirmation.
Through the button below.`,
        {
            reply_markup: {
    inline_keyboard: [
        [{ text: '📤 Upload Payment Proof', callback_data: 'upload_proof' }],
        [{ text: '⬅ Back', callback_data: 'vip' }]
    ]
}
        }
    );
}

        // LIFETIME VIP
        else if (data === 'lifetime') {

paymentRequests[chatId] = {
    package: "VIP Lifetime",
    amount: 100
};

awaitingProof[chatId] = true;


    await bot.sendMessage(
        chatId,
        `🚀 VIP LIFETIME

Price: $100 ( 60,000 FCFA)

Payment Method:
USDT (TRC20)  &  MTN Mobile Money 

Wallet Address: USDT TRC20 👇👇

<code>TPemwgrm4H8PdgQH3aHRKKepXBejdX4vSZ</code>


MTN Mobile Money 👇👇

672823914 (Camilus Dobli dingha)


After payment, send your screenshot to the admin for confirmation.
Through the button below.`,
        {
            parse_mode: "HTML",
            reply_markup: {
                inline_keyboard: [
                   [{ text: '📤 Upload Payment Proof', callback_data: 'upload_proof' }],,
                    [{ text: '⬅ Back', callback_data: 'vip' }]
                ]
            }
        }
    );
}
        // MENTORSHIP
        else if (data === 'mentorship') {

    await bot.sendMessage(
        chatId,
        `🎓 ONE-ON-ONE MENTORSHIP

Get personalized guidance designed around your trading experience, goals, and current skill level.

Choose One-on-One Mentorship below to see the program details.`,
        {
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: '👤 One-on-One Mentorship',
                            callback_data: 'oneonone'
                        }
                    ],
                    [
                        {
                            text: '⬅ Back',
                            callback_data: 'back_main'
                        }
                    ]
                ]
            }
        }
    );
}

     else if (data === 'oneonone') {

    await bot.sendMessage(
        chatId,
        `👤 ONE-ON-ONE MENTORSHIP

Get personalized, one-on-one trading guidance tailored to your current experience and goals.

💰 MENTORSHIP PRICING

🟢 COMPLETE BEGINNER
$1,000

Designed for traders who are completely new to trading and need comprehensive guidance from the fundamentals through practical trading development.

🔵 INTERMEDIATE / ADVANCED
$500

Designed for traders who already have trading experience and want to improve their strategy, execution, risk management, and overall consistency.

📞 ENROLLMENT

For enrollment, availability, and further details, contact admin directly.

👉 @Camiforex237`,
        {
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: '📞 Contact Admin',
                            url: 'https://t.me/Camiforex237'
                        }
                    ],
                    [
                        {
                            text: '⬅ Back',
                            callback_data: 'mentorship'
                        }
                    ]
                ]
            }
        }
    );
}

        else if (data === 'groupmentor') {

    await bot.sendMessage(
        chatId,
        `👥 GROUP MENTORSHIP

Learn alongside other traders through live sessions and discussions.

Contact admin for pricing and enrollment.`,
        {
            reply_markup: {
                inline_keyboard: [
                    [{ text: '📤 Upload Payment Proof', callback_data: 'upload_proof' }],
                    [{ text: '⬅ Back', callback_data: 'mentorship' }]
                ]
            }
        }
    );
}

        // LEARN FOREX
        else if (data === 'learn') {

    await bot.sendMessage(
        chatId,
        `📚 FREE FOREX COURSE

To join our FREE Forex Course Group, you need an Exness account registered under our partner link.

Do you already have an Exness account?

Choose an option below.`,
        {
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: '✅ Yes, I Have an Exness Account',
                            callback_data: 'course_existing_account'
                        }
                    ],
                    [
                        {
                            text: "🆕 No, I'm New to Exness",
                            callback_data: 'course_new_account'
                        }
                    ],
                    [
                        {
                            text: '⬅ Back',
                            callback_data: 'back_main'
                        }
                    ]
                ]
            }
        }
    );

}

else if (data === 'course_existing_account') {

    await bot.sendMessage(
        chatId,
        `📚 EXNESS ACCOUNT

If you already have an Exness account, you can verify the email associated with your account.

If your Exness account is already under our partner link, simply verify your account below.

If your account is NOT under our partner link, you can switch your partner first.

⚠️ Note: An account with zero deposits/trades will not pass verification.

Choose an option below.`,
        {
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: '🔄 Switch Partner',
                            callback_data: 'course_switch_partner'
                        }
                    ],
                    [
                        {
                            text: '📧 Verify Exness Account',
                            callback_data: 'course_verify_existing'
                        }
                    ],
                    [
                        {
                            text: '⬅ Back',
                            callback_data: 'learn'
                        }
                    ]
                ]
            }
        }
    );

}

else if (data === 'course_switch_partner') {

    await bot.sendMessage(
        chatId,
        `🔄 CHANGE YOUR EXNESS PARTNER

If your Exness account is not currently under our partner link, follow the steps below to change your partner.

1️⃣ Log in to your Exness account.

2️⃣ Go to your Profile.

3️⃣ Open Live Chat with Exness Support.

4️⃣ Type:

"Change partner"

5️⃣ Click the link that Exness Support sends you.

6️⃣ Select "Rebate" as the reason.

7️⃣ Paste our Exness partner link below:

🔗 https://one.exnessonelink.com/a/895rrfumo2

After completing the partner change, return here and verify your Exness account email.`,
        {
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: '🔗 Open Exness Support',
                            url: 'https://www.exness.com/support/'
                        }
                    ],
                    [
                        {
                            text: '📧 Verify Exness Account',
                            callback_data: 'course_verify_existing'
                        }
                    ],
                    [
                        {
                            text: '⬅ Back',
                            callback_data: 'course_existing_account'
                        }
                    ]
                ]
            }
        }
    );

}

else if (data === 'course_new_account') {

    await bot.sendMessage(
        chatId,
        `🆕 CREATE YOUR EXNESS ACCOUNT

You don't have an Exness account yet.

To access our FREE Forex Course, you need to:

1️⃣ Create your Exness account using our official partner link below
2️⃣ Deposit funds and/or start trading on that account
3️⃣ Return here and verify your account

⚠️ Note: An account with zero deposits/trades will not pass verification.`,
        {
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: '🔗 Create Exness Account',
                            url: 'https://one.exnessonelink.com/a/895rrfumo2'
                        }
                    ],
                    [
                        {
                            text: '✅ Account Created — Verify Now',
                            callback_data: 'course_verify_new'
                        }
                    ],
                    [
                        {
                            text: '⬅ Back',
                            callback_data: 'learn'
                        }
                    ]
                ]
            }
        }
    );

}

else if (data === 'course_verify_new') {

    awaitingEmail[chatId] = "course";

    await bot.sendMessage(
        chatId,
        `📧 COURSE VERIFICATION

Please send the email you used to register your Exness account through our partner link.

Example:

name@gmail.com`,
        {
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: '⬅ Back',
                            callback_data: 'course_new_account'
                        }
                    ]
                ]
            }
        }
    );

}

else if (data === "course_not_registered") {

    await bot.sendMessage(
        chatId,
        `❌ You must first create your Exness account using our official partner link.

After registration, return here and verify your email.`,
        {
            reply_markup: {
                inline_keyboard: [

                    [
                        {
                            text: "🔗 Create Exness Account",
                            url: "https://one.exnessonelink.com/a/895rrfumo2"
                        }
                    ],

                    [
                        {
                            text: "✅ Verify your Registered Email",
                            callback_data: "course_registered"
                        }
                    ],

                    [
                        {
                            text: "⬅ Back",
                            callback_data: "back_main"
                        }
                    ]

                ]
            }
        }
    );

}

else if (data === "course_verify_existing") {

    awaitingEmail[chatId] = "course";

    await bot.sendMessage(
        chatId,
        `📧 COURSE VERIFICATION

Please send the email associated with your Exness account.

Example:

name@gmail.com`,
        {
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: "⬅ Back",
                            callback_data: "course_existing_account"
                        }
                    ]
                ]
            }
        }
    );

}

else if (data === "course_registered") {

    awaitingEmail[chatId] = "course";

    await bot.sendMessage(
        chatId,
        `📧 COURSE VERIFICATION

Please send the email you used to register your Exness account.

Example:

name@gmail.com`,
        {
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: "⬅ Back",
                            callback_data: "learn"
                        }
                    ]
                ]
            }
        }
    );

}
        

        // WHY VIP
    else if (data === 'whyvip') {

    await bot.sendMessage(
        chatId,
        `💡 WHY JOIN VIP?

Receive market insights, trading ideas, mentorship, and access to a community of traders working toward consistent growth.`,
        {
            reply_markup: {
                inline_keyboard: [
                    [{ text: '💎 View VIP Plans', callback_data: 'vip' }],
                    [{ text: '⬅ Back', callback_data: 'back_main' }]
                ]
            }
        }
    );
}

        // CONTACT
        else if (data === 'contact') {

    await bot.sendMessage(
        chatId,
        `📞 CONTACT ADMIN

Telegram:
@Camiforex237`,
        {
            reply_markup: {
                inline_keyboard: [
                    [{ text: '⬅ Back', callback_data: 'back_main' }]
                ]
            }
        }
    );
}

else if (data === 'back_main') {

    await bot.sendMessage(
        chatId,
        `🏠 MAIN MENU

Choose an option below.`,
        {
            reply_markup: {
                inline_keyboard: [

    [{ text:'⭐ Join Free VIP', callback_data:'free_vip' }],

    [{ text:'💎 Paid VIP Access', callback_data:'vip' }],

    [{ text:'🎓 Mentorship', callback_data:'mentorship' }],

    [{ text:'📖 Learn Forex (Free)', callback_data:'learn' }],

    [{ text:'💡 Why Join VIP?', callback_data:'whyvip' }],

    [{ text:'📞 Contact Admin', callback_data:'contact' }]

]
            }
        }
    );
}

else if (data === 'upload_proof') {

    awaitingProof[chatId] = true;

    await bot.sendMessage(
        chatId,
        `📤 UPLOAD PAYMENT PROOF

Please send a screenshot of your payment.

Once submitted, our team will review it and notify you of the outcome.`,
        {
            reply_markup: {
                inline_keyboard: [
                    [{ text: '⬅ Back', callback_data: 'vip' }]
                ]
            }
        }
    );
}

else if (data === "admin_stats") {

    if (!ADMINS.includes(chatId)) {
        return;
    }

    const monthly = subscriptions.filter(
        s => s.package === "VIP Monthly"
    ).length;

    const yearly = subscriptions.filter(
        s => s.package === "VIP Yearly"
    ).length;

    const lifetime = subscriptions.filter(
        s => s.package === "VIP Lifetime"
    ).length;

    await bot.sendMessage(
        chatId,
`📊 VIP STATISTICS

👥 Total Subscribers: ${subscriptions.length}

📅 Monthly: ${monthly}
👑 Yearly: ${yearly}
🚀 Lifetime: ${lifetime}`
    );

}
else if (data === "admin_subscribers") {

    if (!ADMINS.includes(chatId)) {
        return;
    }

    if (subscriptions.length === 0) {

        return bot.sendMessage(
            chatId,
            "No active subscribers."
        );

    }

    let text = "👥 ACTIVE SUBSCRIBERS\n\n";

    subscriptions.forEach((sub, index) => {

        text += `${index + 1}.\n`;

        text += `🆔 ${sub.userId}\n`;

        text += `📦 ${sub.package}\n`;

        if (sub.expiresAt === null) {

            text += `♾ Never Expires\n\n`;

        } else {

            const daysLeft = Math.ceil(
                (sub.expiresAt - Date.now()) /
                (1000 * 60 * 60 * 24)
            );

            const expiry = new Date(sub.expiresAt)
                .toLocaleDateString();

            text += `📅 Expires: ${expiry}\n`;

            text += `⏳ Days Left: ${daysLeft}\n\n`;

        }

        text += "━━━━━━━━━━━━━━\n\n";

    });

    await bot.sendMessage(chatId, text);

}

        await bot.answerCallbackQuery(query.id);

    } catch (error) {

        console.log(error);

        bot.sendMessage(
            chatId,
            'An error occurred. Please try again.'
        );
    }
});

async function createInviteLink(chatId) {

    try {

        const invite = await bot.createChatInviteLink(VIP_GROUP_ID, {
            member_limit: 1, // one-time use link
            expire_date: Math.floor(Date.now() / 1000) + 3600 // 1 hour expiry
        });

        return invite.invite_link;

    } catch (err) {

        console.log("Invite link error:", err.message);

        return null;
    }
}

async function createCourseInviteLink(chatId) {

    try {

        const invite = await bot.createChatInviteLink(COURSE_GROUP_ID, {
            member_limit: 1,
            expire_date: Math.floor(Date.now() / 1000) + 3600
        });

        return invite.invite_link;

    } catch (err) {

        console.log("Course invite error:", err.message);

        return null;
    }

}

function saveSubscriptions() {

    fs.writeFileSync(
        "subscriptions.json",
        JSON.stringify(subscriptions, null, 4)
    );

}

function saveVerifiedEmails() {

    fs.writeFileSync(
        "verifiedEmails.json",
        JSON.stringify(verifiedEmails, null, 4)
    );

}

async function checkVerifiedEmailsPartnerStatus() {

    console.log("🔍 Checking verified Exness accounts...");

    for (const user of verifiedEmails) {

        // Only check users who have access to at least
        // one of the Exness-dependent groups.
        if (!user.vip && !user.course) {
            continue;
        }

        if (!user.email || !user.telegramId) {
            continue;
        }

        if (user.partnerAccessRevoked) {
            continue;
        }

        try {

            const response = await axios.post(
                "https://exness-verification-server-production.up.railway.app/verify",
                {
                    email: user.email
                }
            );

            const result = response.data;

            console.log(
                `Partner check for ${user.email}:`,
                result.category
            );

            // Account is still associated with our partner.
            if (result.category === "ACTIVE_CLIENT") {
                continue;
            }

            // Account is no longer associated with our partner.
            if (result.category === "NOT_ASSOCIATED") {

                console.log(
                    `⚠️ ${user.email} is no longer associated with our partner.`
                );

                const telegramId = Number(user.telegramId);

                // Remove from FREE VIP group.
                if (user.vip) {

                    try {

                        await bot.banChatMember(
                            VIP_GROUP_ID,
                            telegramId
                        );

                        await bot.unbanChatMember(
                            VIP_GROUP_ID,
                            telegramId
                        );

                        console.log(
                            `Removed ${telegramId} from Free VIP.`
                        );

                    } catch (err) {

                        console.log(
                            `Could not remove ${telegramId} from Free VIP:`,
                            err.message
                        );

                    }

                }

                // Remove from FREE COURSE group.
                if (user.course) {

                    try {

                        await bot.banChatMember(
                            COURSE_GROUP_ID,
                            telegramId
                        );

                        await bot.unbanChatMember(
                            COURSE_GROUP_ID,
                            telegramId
                        );

                        console.log(
                            `Removed ${telegramId} from Free Course.`
                        );

                    } catch (err) {

                        console.log(
                            `Could not remove ${telegramId} from Free Course:`,
                            err.message
                        );

                    }

                }

                // Mark access as revoked so we don't repeatedly
                // notify the same user every day.
                user.partnerAccessRevoked = true;
                user.partnerRevokedAt = Date.now();

                try {

                    await bot.sendMessage(
                        telegramId,
                        `❌ EXNESS PARTNER VERIFICATION REQUIRED

Your Exness account is no longer associated with our partner link.

Because access to our FREE VIP and FREE FOREX COURSE requires an Exness account registered under our partner link, your access has been removed.

You can regain access by verifying your Exness account again.

After your account is successfully associated with our partner link, you can join the available groups again.`,
                        {
                            reply_markup: {
    inline_keyboard: [
        [
            {
                text: "⭐ Join Free VIP",
                callback_data: "free_vip"
            }
        ],
        [
            {
                text: "📚 Join Free Course",
                callback_data: "learn"
            }
        ],
        [
            {
                text: "🏠 Main Menu",
                callback_data: "back_main"
            }
        ]
    ]
}
                        }
                    );

                } catch (err) {

                    console.log(
                        `Could not notify ${telegramId}:`,
                        err.message
                    );

                }

            }

        } catch (err) {

            console.log(
                `Partner check failed for ${user.email}:`,
                err.message
            );

        }

    }

    saveVerifiedEmails();

    console.log("✅ Verified Exness account check completed.");

}

bot.on('message', async (msg) => {

    const chatId = msg.chat.id;

    if (msg.text && msg.text.startsWith('/')) {
        return;
    }

    if (!awaitingEmail[chatId]) {
        return;
    }

    const mode = awaitingEmail[chatId];

if (!msg.text) {
    return;
}

const email = msg.text.trim().toLowerCase();

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

if (!emailRegex.test(email)) {

    return bot.sendMessage(
        chatId,
        "❌ Please send a valid email address."
    );

}

delete awaitingEmail[chatId];

let verifiedUser = verifiedEmails.find(
    user => user.email === email
);

if (!verifiedUser) {

    verifiedUser = {
        email,
        vip: false,
        course: false
    };

    verifiedEmails.push(verifiedUser);
}
if (mode === "vip" && verifiedUser.vip) {

    return bot.sendMessage(
        chatId,
        `❌ EMAIL ALREADY VERIFIED

This email has already been used to access FREE VIP.

If you believe this is an error, please contact the administrator.`,
        {
            reply_markup: {
                inline_keyboard: [
                    [{ text: "📞 Contact Admin", callback_data: "contact" }],
                    [{ text: "🏠 Main Menu", callback_data: "back_main" }]
                ]
            }
        }
    );

}

if (mode === "course" && verifiedUser.course) {

    return bot.sendMessage(
        chatId,
        `❌ EMAIL ALREADY VERIFIED

This email has already been used to access the FREE COURSE.

If you believe this is an error, please contact the administrator.`,
        {
            reply_markup: {
                inline_keyboard: [
                    [{ text: "📞 Contact Admin", callback_data: "contact" }],
                    [{ text: "🏠 Main Menu", callback_data: "back_main" }]
                ]
            }
        }
    );

}


    await bot.sendMessage(
        chatId,
        "⏳ Verifying your Exness account..."
    );

    try {

        const response = await axios.post(
                        "https://exness-verification-server-production.up.railway.app/verify",
            {
                email: email
            }
        );

        const result = response.data;

       if (result.category === "ACTIVE_CLIENT") {

if (mode === "vip") {
    verifiedUser.vip = true;
}

if (mode === "course") {
    verifiedUser.course = true;
}

verifiedUser.telegramId = chatId;
verifiedUser.verifiedAt = Date.now();

saveVerifiedEmails();

    if (mode === "vip") {

        const inviteLink = await createInviteLink(chatId);

        if (!inviteLink) {
            return bot.sendMessage(
                chatId,
                `✅ VERIFIED

Welcome to FREE VIP!

⚠️ Could not generate invite link. Please contact admin.`
            );
        }

        return bot.sendMessage(
            chatId,
            `✅ VERIFIED

Trading activity confirmed.

🎉 Welcome to our FREE VIP!

👇 Click below to join your VIP group.`,
            {
               reply_markup: {
    inline_keyboard: [
        [
            {
                text: "🚀 Join VIP Group",
                url: inviteLink
            }
        ],
        [
            {
                text: "🏠 Main Menu",
                callback_data: "back_main"
            }
        ]
    ]
}
            }
        );

    } else if (mode === "course") {

        const inviteLink = await createCourseInviteLink(chatId);

        if (!inviteLink) {
            return bot.sendMessage(
                chatId,
                `✅ VERIFIED

Welcome to the FREE Forex Course!

⚠️ Could not generate your course invite link. Please contact admin.`
            );
        }

        return bot.sendMessage(
            chatId,
            `✅ VERIFIED

Your registration has been confirmed.

📚 Welcome to our FREE Forex Course!

👇 Click the button below to join the private course group.`,
            {
                reply_markup: {
    inline_keyboard: [
        [
            {
                text: "📖 Join Course Group",
                url: inviteLink
            }
        ],
        [
            {
                text: "🏠 Main Menu",
                callback_data: "back_main"
            }
        ]
    ]
}
            }
        );

    }

}

        if (result.category === "FUNDED_ONLY") {

            return bot.sendMessage(
                chatId,
                `✅ VERIFIED

Your account is funded.

Welcome to our FREE VIP!`
            );

        }

        if (result.category === "FUND_ACCOUNT") {

            if (mode === "course") {

                return bot.sendMessage(
                    chatId,
                    `❌ NOT ELIGIBLE YET

Your Exness account is associated with our partner link, but it hasn't been funded or hasn't traded yet.

To join the FREE Forex Course, you need to:

1️⃣ Deposit funds into your Exness account
2️⃣ Start trading (or keep funds deposited)
3️⃣ Come back and verify again

👇 Log in to your Exness account to make a deposit.`,
                    {
                        reply_markup: {
                            inline_keyboard: [
                                [
                                    {
                                        text: "💰 Log In & Fund Account",
                                        url: "https://one.exnessonelink.com/a/895rrfumo2"
                                    }
                                ],
                                [
                                    {
                                        text: "📧 Verify Again",
                                        callback_data: "course_verify_existing"
                                    }
                                ],
                                [
                                    {
                                        text: "📞 Contact Admin",
                                        callback_data: "contact"
                                    }
                                ],
                                [
                                    {
                                        text: "🏠 Main Menu",
                                        callback_data: "back_main"
                                    }
                                ]
                            ]
                        }
                    }
                );

            }

            // mode === "vip"
            return bot.sendMessage(
                chatId,
                `❌ NOT ELIGIBLE YET

Your Exness account is associated with our partner link, but it hasn't been funded or hasn't traded yet.

To join FREE VIP, you need to:

1️⃣ Deposit funds into your Exness account
2️⃣ Start trading (or keep funds deposited)
3️⃣ Come back and verify again

👇 Log in to your Exness account to make a deposit.`,
                {
                    reply_markup: {
                        inline_keyboard: [
                            [
                                {
                                    text: "💰 Log In & Fund Account",
                                    url: "https://one.exnessonelink.com/a/895rrfumo2"
                                }
                            ],
                            [
                                {
                                    text: "📧 Verify Again",
                                    callback_data: "vip_verify_existing"
                                }
                            ],
                            [
                                {
                                    text: "📞 Contact Admin",
                                    callback_data: "contact"
                                }
                            ],
                            [
                                {
                                    text: "🏠 Main Menu",
                                    callback_data: "back_main"
                                }
                            ]
                        ]
                    }
                }
            );

        }

      if (result.category === "NOT_ASSOCIATED") {

    if (mode === "course") {

        return bot.sendMessage(
            chatId,
            `❌ WE COULDN'T VERIFY YOUR EMAIL

This email is not currently associated with our Exness partner link.

Do you have an Exness account registered with this email?

Choose an option below.`,
            {
                reply_markup: {
                    inline_keyboard: [
                        [
                            {
                                text: "✅ Yes, I Have an Exness Account",
                                callback_data: "course_verification_has_account"
                            }
                        ],
                        [
                            {
                                text: "🆕 No, I Don't Have an Account",
                                callback_data: "course_verification_no_account"
                            }
                        ],
                        [
                            {
                                text: "📧 Try a Different Email",
                                callback_data: "course_verification_different_email"
                            }
                        ],
                        [
                            {
                                text: "🏠 Main Menu",
                                callback_data: "back_main"
                            }
                        ]
                    ]
                }
            }
        );

    }

    // FREE VIP verification failed
    return bot.sendMessage(
        chatId,
        `❌ WE COULDN'T VERIFY YOUR EMAIL

This email is not currently associated with our Exness partner link.

Do you have an Exness account registered with this email?

Choose an option below.`,
        {
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: "✅ Yes, I Have an Exness Account",
                            callback_data: "verification_has_account"
                        }
                    ],
                    [
                        {
                            text: "🆕 No, I Don't Have an Account",
                            callback_data: "verification_no_account"
                        }
                    ],
                    [
                        {
                            text: "📧 Try a Different Email",
                            callback_data: "verification_different_email"
                        }
                    ],
                    [
                        {
                            text: "🏠 Main Menu",
                            callback_data: "back_main"
                        }
                    ]
                ]
            }
        }
    );

}

        if (result.category === "ERROR") {

            console.log("Verification ERROR payload:", result.message);

            return bot.sendMessage(
                chatId,
                `⚠️ VERIFICATION ISSUE

We couldn't complete the check on our end (not a problem with your account). Please try again in a moment, or contact admin if this keeps happening.`,
                {
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: "📞 Contact Admin", callback_data: "contact" }],
                            [{ text: "🏠 Main Menu", callback_data: "back_main" }]
                        ]
                    }
                }
            );

        }

        return bot.sendMessage(
            chatId,
            `⚠️ UNRECOGNIZED RESPONSE

We received an unexpected result (category: ${result.category || "unknown"}). Please contact admin.`,
            {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: "📞 Contact Admin", callback_data: "contact" }],
                        [{ text: "🏠 Main Menu", callback_data: "back_main" }]
                    ]
                }
            }
        );

    } catch (err) {

        console.log(err);

        bot.sendMessage(
            chatId,
            "Unable to contact the verification server."
        );

    }

});

bot.on('photo', async (msg) => {

    const chatId = msg.chat.id;

    if (!awaitingProof[chatId]) {
        return;
    }

    awaitingProof[chatId] = false;

    const payment = paymentRequests[chatId];

    if (!payment) {
        return bot.sendMessage(chatId, "❌ No package selected. Please restart payment.");
    }

    const caption = `
💳 NEW VIP PAYMENT

👤 Name: ${msg.from.first_name}
📱 Username: @${msg.from.username || "None"}
🆔 Telegram ID: ${chatId}

📦 Package: ${payment.package}
💰 Amount: ${payment.amount}

🟡 Status: Pending Approval
`;

    await bot.sendPhoto(
        ADMIN_GROUP_ID,
        msg.photo[msg.photo.length - 1].file_id,
        {
            caption,
            reply_markup: {
                inline_keyboard: [
                    [
                        {
                            text: "✅ Approve",
                            callback_data: `approve_${chatId}`
                        },
                        {
                            text: "❌ Reject",
                            callback_data: `reject_${chatId}`
                        }
                    ]
                ]
            }
        }
    );

    await bot.sendMessage(
        chatId,
        `✅ PAYMENT RECEIVED

⏳ Under Review

We will notify you once approved.`,
        {
            reply_markup: {
                inline_keyboard: [
                    [{ text: "🏠 Main Menu", callback_data: "back_main" }]
                ]
            }
        }
    );
});

bot.on("callback_query", async (query) => {

    const data = query.data;

    if (!data.startsWith("approve_") && !data.startsWith("reject_")) {
        return;
    }

    const userId = data.split("_")[1];

    if (data.startsWith("approve_")) {

        await bot.editMessageCaption(

            query.message.caption.replace(
                "🟡 Status: Pending Approval",
                "🟢 Status: APPROVED"
            ),

            {
                chat_id: query.message.chat.id,
                message_id: query.message.message_id,
                reply_markup: {
                    inline_keyboard: []
                }
            }

        );

        const payment = paymentRequests[userId];
let expiresAt = null;

if (payment.package === "VIP Monthly") {

    expiresAt = Date.now() + (30 * 24 * 60 * 60 * 1000);

}

else if (payment.package === "VIP Yearly") {

    expiresAt = Date.now() + (365 * 24 * 60 * 60 * 1000);

}

// Lifetime remains null

const existing = subscriptions.find(
    s => s.userId == userId
);

const now = Date.now();

if (existing) {

    // Lifetime stays lifetime
    if (payment.package === "VIP Lifetime") {

        existing.package = "VIP Lifetime";
        existing.joinedAt = now;
        existing.expiresAt = null;

    } else {

        // If subscription is still active,
        // extend from current expiry.
        let baseTime = now;

        if (
            existing.expiresAt &&
            existing.expiresAt > now
        ) {
            baseTime = existing.expiresAt;
        }

        if (payment.package === "VIP Monthly") {

            existing.expiresAt =
                baseTime + (30 * 24 * 60 * 60 * 1000);

        }

        else if (payment.package === "VIP Yearly") {

            existing.expiresAt =
                baseTime + (365 * 24 * 60 * 60 * 1000);

        }

        existing.package = payment.package;
        existing.joinedAt = now;
        existing.reminderSent = false;

    }

} else {

    subscriptions.push({

    userId,

    package: payment.package,

    joinedAt: now,

    expiresAt,

    reminderSent: false

});

}
console.log("Saving subscription...");
console.log(subscriptions);
saveSubscriptions();

if (!payment) return;

const inviteLink = await createInviteLink(userId);

if (!inviteLink) {

    return bot.sendMessage(
        userId,
        "❌ Payment approved, but I couldn't generate your VIP invite link.\nPlease contact an administrator."
    );

}

await bot.sendMessage(
    userId,
    `✅ PAYMENT APPROVED

Your ${payment.package} subscription has been activated.

🎉 Welcome to Premium VIP!

👇 Click below to join the VIP group.`,
    {
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: "🚀 Join VIP Group",
                        url: inviteLink
                    }
                ]
            ]
        }
    }
);

delete paymentRequests[userId];
    }

    else if (data.startsWith("reject_")) {

        await bot.editMessageCaption(

            query.message.caption.replace(
                "🟡 Status: Pending Approval",
                "🔴 Status: REJECTED"
            ),

            {
                chat_id: query.message.chat.id,
                message_id: query.message.message_id,
                reply_markup: {
                    inline_keyboard: []
                }
            }

        );

        await bot.sendMessage(
    userId,
    `❌ PAYMENT REJECTED

Unfortunately, your payment could not be confirmed.

If you believe this was a mistake, please contact the administrator.

📞 Admin: @Camiforex237

You can also submit your payment proof again below.`,
    {
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: "📤 Submit Again",
                        callback_data: "upload_proof"
                    }
                ],
                [
                    {
                        text: "🏠 Main Menu",
                        callback_data: "back_main"
                    }
                ]
            ]
        }
    }
);

    }

    await bot.answerCallbackQuery(query.id);

});
async function checkExpiredSubscriptions() {

    const now = Date.now();

    let changed = false;

    for (const sub of [...subscriptions]) {

        // Skip lifetime subscriptions
        if (sub.expiresAt === null) {
            continue;
        }

        // Still active
        if (sub.expiresAt > now) {
            continue;
        }

        console.log(`Subscription expired for ${sub.userId}`);

        try {

            // Remove from VIP group
            await bot.banChatMember(
                VIP_GROUP_ID,
                Number(sub.userId)
            );

            // Immediately unban so they can rejoin later
            await bot.unbanChatMember(
                VIP_GROUP_ID,
                Number(sub.userId)
            );

        } catch (err) {

            console.log(
                `Couldn't remove ${sub.userId}:`,
                err.message
            );

        }

        try {

           await bot.sendMessage(
    sub.userId,
    `❌ YOUR VIP SUBSCRIPTION HAS EXPIRED

Your access to the Premium VIP group has ended.

To continue receiving:
• 📈 Premium trading signals
• 🎯 Market analysis

Please renew your subscription below.`,
    {
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: "💎 View VIP Plans",
                        callback_data: "vip"
                    }
                ],
                [
                    {
                        text: "🏠 Main Menu",
                        callback_data: "back_main"
                    }
                ]
            ]
        }
    }
);

        } catch (err) {

            console.log(
                "Couldn't notify user:",
                err.message
            );

        }

        subscriptions = subscriptions.filter(
            s => s.userId != sub.userId
        );

        changed = true;

    }

    if (changed) {
        saveSubscriptions();
    }

}

async function checkRenewalReminders() {

    const now = Date.now();

    let changed = false;

    for (const sub of subscriptions) {

        // Lifetime members don't expire
        if (sub.expiresAt === null)
            continue;

        // Already reminded
        if (sub.reminderSent)
            continue;

        const hoursLeft =
            (sub.expiresAt - now) / (1000 * 60 * 60);

        if (hoursLeft <= 24 && hoursLeft > 0) {

            try {

                await bot.sendMessage(
                    sub.userId,
                    `⏰ VIP SUBSCRIPTION EXPIRING SOON

Your ${sub.package} subscription will expire in less than 24 hours.

Renew now to avoid losing access to:

• 📈 Premium Signals
• 🎯 Market Analysis

Choose an option below.`,
                    {
                        reply_markup: {
                            inline_keyboard: [
                                [
                                    {
                                        text: "💎 Renew VIP",
                                        callback_data: "vip"
                                    }
                                ],
                                [
                                    {
                                        text: "🏠 Main Menu",
                                        callback_data: "back_main"
                                    }
                                ]
                            ]
                        }
                    }
                );

                sub.reminderSent = true;

                changed = true;

            } catch (err) {

                console.log(
                    "Reminder failed:",
                    err.message
                );

            }

        }

    }

    if (changed)
        saveSubscriptions();

}
setInterval(checkExpiredSubscriptions, 5 * 60 * 1000);
setInterval(checkRenewalReminders, 5 * 60 * 1000);

// Check verified Exness partner status once every 24 hours.
setInterval(
    checkVerifiedEmailsPartnerStatus,
    24 * 60 * 60 * 1000
);
