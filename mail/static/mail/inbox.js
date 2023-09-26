document.addEventListener('DOMContentLoaded', function() {

    // Use buttons to toggle between views
    document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
    document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
    document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
    document.querySelector('#compose').addEventListener('click', compose_email);

    document.querySelector('#compose-form').addEventListener('submit', send_email);

    // By default, load the inbox
    load_mailbox('inbox');
});

function send_email(event){
    event.preventDefault();

    const recipients_val = document.querySelector('#compose-recipients').value;
    const subject_val = document.querySelector('#compose-subject').value;
    const body_val = document.querySelector('#compose-body').value;

    console.log(recipients_val);
    console.log(subject_val);
    console.log(body_val);

    fetch('/emails', {
        method: 'POST',
        body: JSON.stringify({
            recipients: recipients_val,
            subject: subject_val,
            body: body_val
        })
    })
    .then(response = function(response){
        return response.json();
    })
    .then(result = function(){
        load_mailbox('sent');
    })
}

function adjust_archive(email, email_id, div_archive){
    if(email.archived === false){
        div_archive.addEventListener('click', function(){
            fetch('/emails/' + email_id, {
                method: 'PUT',
                body: JSON.stringify({
                    archived: true
                })
            })
            .then(function(){
                load_mailbox('inbox');
            })
        })
    }
    else{
        div_archive.addEventListener('click', function(){
            fetch('/emails/' + email_id, {
                method: 'PUT',
                body: JSON.stringify({
                    archived: false
                })
            })
            .then(function(){
                load_mailbox('inbox');
            })
        })
    }
}

function reply(email, div_reply){
    div_reply.addEventListener('click', function(){
        // Show compose view and hide other views
        document.querySelector('#email').style.display = 'none';
        document.querySelector('#emails-view').style.display = 'none';
        document.querySelector('#compose-view').style.display = 'block';

        document.querySelector('#compose-recipients').value = email.sender;
        if(email.subject.includes('Re:') === true){
            document.querySelector('#compose-subject').value = `${email.subject}`;
        }
        else{
            document.querySelector('#compose-subject').value = `Re: ${email.subject}`;
        }
        if(email.body.includes('---')){
            document.querySelector('#compose-body').value = email.body;
        }
        else{
            document.querySelector('#compose-body').value = `On ${email.timestamp} ${email.sender} wrote: ${email.body}\n---\n`;
        }
    });
}

function display_email(email_id, mailbox){
    document.querySelector('#email').innerHTML = '';

    document.querySelector('#email').style.display = 'block';
    document.querySelector('#emails-view').style.display = 'none';

    fetch('/emails/' + email_id)
    .then(response = function(response){
        return response.json();
    })
    .then(email = function(email){
        const div_archive = document.createElement('button');
        div_archive.id = 'archive';

        if(email.archived === false){
            div_archive.innerHTML = 'Archive';    
        }
        else{
            div_archive.innerHTML = 'Unarchive';
        }

        const div_reply = document.createElement('button');
        div_reply.id = 'reply';
        div_reply.innerHTML = 'Reply';

        const div = document.createElement('div');
        div.id = 'div_email';

        const div_sender = document.createElement('div');
        div_sender.id = 'div_sender';
        const sender = document.createElement('span');
        sender.innerHTML = email.sender;
        sender.id = 'sender_email';
        const sender_title = document.createElement('span');
        sender_title.innerHTML = 'From: ';
        sender_title.id = 'sender_title';
        div_sender.append(sender_title);
        div_sender.append(sender);

        const div_recipients = document.createElement('div');
        div_recipients.id = 'div_recipients';
        const recipients = document.createElement('span');
        recipients.innerHTML = email.recipients;
        recipients.id = 'recipients_email';
        const recipients_title = document.createElement('span');
        recipients_title.innerHTML = 'To: ';
        recipients_title.id = 'recipients_title';
        div_recipients.append(recipients_title);
        div_recipients.append(recipients);

        const div_subject = document.createElement('div');
        div_subject.id = 'div_subject';
        const subject = document.createElement('span');
        subject.innerHTML = email.subject;
        subject.id = 'subject_email';
        const subject_title = document.createElement('span');
        subject_title.innerHTML = 'Subject: ';
        subject_title.id = 'subject_title';
        div_subject.append(subject_title);
        div_subject.append(subject);

        const div_timestamp = document.createElement('div');
        div_timestamp.id = 'div_timestamp';
        const timestamp = document.createElement('span');
        timestamp.innerHTML = email.timestamp;
        timestamp.id = 'timestamp_email';
        const timestamp_title = document.createElement('span');
        timestamp_title.innerHTML = 'Date: ';
        timestamp_title.id = 'timestamp_title';
        div_timestamp.append(timestamp_title);
        div_timestamp.append(timestamp);

        const div_body = document.createElement('div');
        div_body.id = 'div_body';
        const body = document.createElement('span');
        body.innerHTML = email.body;
        body.id = 'body_email';
        const body_title = document.createElement('span');
        body_title.innerHTML = 'Message: ';
        body_title.id = 'body_title';
        div_body.append(body_title);
        div_body.append(body);

        div.append(div_sender);
        div.append(div_recipients);
        div.append(div_subject);
        div.append(div_timestamp);
        div.append(div_body);
        if(mailbox === 'inbox' || mailbox === 'archive'){
            div.append(div_archive);
        }
        div.append(div_reply);

        document.querySelector('#email').append(div);

        fetch('/emails/' + email_id, {
            method: 'PUT',
            body: JSON.stringify({
                read: true
            })
        })

        adjust_archive(email, email_id, div_archive);
        reply(email, div_reply);
    })
}

function compose_email() {

    // Show compose view and hide other views
    document.querySelector('#email').style.display = 'none';
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'block';

    // Clear out composition fields
    document.querySelector('#compose-recipients').value = '';
    document.querySelector('#compose-subject').value = '';
    document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {  
    // Show the mailbox and hide other views
    document.querySelector('#email').style.display = 'none';
    document.querySelector('#emails-view').style.display = 'block';
    document.querySelector('#compose-view').style.display = 'none';

    // Show the mailbox name
    document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

    fetch('/emails/' + mailbox)
    .then(response = function(response){
        return response.json();
    })
    .then(emails = function(emails){
        const last10Emails = emails.slice(0, 10);
        last10Emails.forEach(function(email) {
            const button = document.createElement('button');
            if(email.read === false){
                button.id = 'button_false';
            }
            else{
                button.id = 'button_true';
            }

            const div = document.createElement('div');
            div.id = 'div';

            const sender = document.createElement('p');
            sender.innerHTML = email.sender;
            sender.id = 'sender';
            const subject = document.createElement('p');
            subject.innerHTML = email.subject;
            subject.id = 'subject';
            const timestamp = document.createElement('p');
            timestamp.innerHTML = email.timestamp;
            timestamp.id = 'timestamp';

            div.append(sender);
            div.append(subject);
            div.append(timestamp);

            button.append(div);

            document.querySelector('#emails-view').append(button);

            button.addEventListener('click', function(){
                display_email(email.id, mailbox);
            });
        });
    })
}