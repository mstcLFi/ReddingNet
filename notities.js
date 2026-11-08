//notities.js

const messages =
    document.getElementById(
        'messages'
    );

const sendButton =
    document.getElementById(
        'sendButton'
    );

const messageField =
    document.getElementById(
        'message'
    );

sendButton.addEventListener(
    'click',
    addMessage
);

function renderMessage(msg){

    const timestamp =
        new Date(
            msg.created_at
        ).toLocaleString(
            'nl-NL',
            {
                year:'numeric',
                month:'2-digit',
                day:'2-digit',
                hour:'2-digit',
                minute:'2-digit',
                second:'2-digit'
            }
        );

    const entry =
        document.createElement(
            'div'
        );

    entry.className =
        'message';

    entry.innerHTML =

        '<div class="message-time">' +
        timestamp +
        '</div>' +

        '<div class="message-user">' +
        msg.username +
        '</div>' +

        '<div class="message-text">' +
        msg.message +
        '</div>';

    messages.appendChild(
        entry
    );
}

async function loadMessages(){

    const { data, error } =
        await supabaseClient
            .from('messages')
            .select('*')
            .order(
                'created_at',
                {
                    ascending:false
                }
            );

    if(error){

        console.error(error);

        return;
    }

    messages.innerHTML = '';

    data.forEach(
        renderMessage
    );
}

async function addMessage(){

    const username =
        document
            .getElementById(
                'name'
            )
            .value
            .trim();

    const messageText =
        document
            .getElementById(
                'message'
            )
            .value
            .trim();

    if(
        !username ||
        !messageText
    ){
        return;
    }

    const { error } =
        await supabaseClient
            .from('messages')
            .insert({

                username:
                    username,

                message:
                    messageText

            });

    if(error){

        console.error(error);

        alert(
            'Opslaan mislukt'
        );

        return;
    }

    document
        .getElementById(
            'message'
        )
        .value = '';

    resizeMessageField();


}

function resizeMessageField(){

    messageField.style.height =
        'auto';

    messageField.style.height =
        messageField.scrollHeight +
        'px';
}

messageField.addEventListener(
    'input',
    resizeMessageField
);

resizeMessageField();

loadMessages();

supabaseClient
    .channel('messages')

    .on(
        'postgres_changes',
        {
            event: 'INSERT',
            schema: 'public',
            table: 'messages'
        },

        () => {

            loadMessages();

        }
    )

    .subscribe();