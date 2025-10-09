import nodemailer from 'nodemailer'
import { WELCOME_EMAIL_TEMPLATE ,NEWS_SUMMARY_EMAIL_TEMPLATE} from './templates'

export const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth : {
        user: process.env.NODEMAILER_EMAIL!,
        pass: process.env.NODEMAILER_PASSWORD!,
    }
})

export const sendWelcomeEmail = async({email , name , intro} : WelcomeEmailData) =>{
    const htmlTemplate = WELCOME_EMAIL_TEMPLATE.replace('{{name}}', name).replace('{{intro}}' , intro);

    const mailOptions = {
        from : `"Finbot" <finbot@arogyacompass.cloud>`,
        to : email,
        subject : ' "Welcome to Finbot - your stock market toolkit is ready!"',
        text : 'Thanks for joining Finbot',
        html : htmlTemplate,
    }

    await transporter.sendMail(mailOptions)
}

export const sendNewsSummaryEmail = async (
    { email, date, newsContent }: { email: string; date: string; newsContent: string }
): Promise<void> => {
    const htmlTemplate = NEWS_SUMMARY_EMAIL_TEMPLATE
        .replace('{{date}}', date)
        .replace('{{newsContent}}', newsContent);

    const mailOptions = {
        from: `"Signalist News" <finbot@arogyacompass.cloud>`,
        to: email,
        subject: `📈 Market News Summary Today - ${date}`,
        text: `Today's market news summary from Signalist`,
        html: htmlTemplate,
    };

    await transporter.sendMail(mailOptions);
};