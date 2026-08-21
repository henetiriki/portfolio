# Contact feature

The `/contact` page lets a visitor send a message to the site owner and receives clear success or failure feedback in the browser.

## Visitor experience

The form validates required fields and basic formatting before submission, then shows a success message or a safe error message. It remains accessible with normal keyboard and browser form behaviour.

## Server handling

The server validates and bounds submitted data, applies automated-abuse protection, and delivers accepted messages through a server-side mail integration. Submitted content is handled safely, public errors stay generic, and sensitive provider details are not exposed to visitors.

An acknowledgement to the sender may be attempted after delivery to the owner. The precise validation rules, abuse controls, mail-provider configuration, and operational failure handling are maintained privately.

## Configuration

The feature needs server-side mail configuration. Maintainers obtain the exact inventory through the approved private channel; credentials never belong in the repository.
