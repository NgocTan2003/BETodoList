import nodemailer from 'nodemailer';
import winston, { log } from 'winston';
import { MAIL_HOST, MAIL_USERNAME, MAIL_PASSWORD } from "../constants/env"

const logger = winston.createLogger({
    level: 'debug',
    format: winston.format.json(),
    transports: [new winston.transports.Console()]
});

export const sendMail = async (to: string, subject: string, html: string) => {
    console.log('send mail ------------------');

    const transporter = nodemailer.createTransport({
        service: MAIL_HOST,
        auth: {
            user: MAIL_USERNAME,
            pass: MAIL_PASSWORD
        }
    });

    const mailOptions = {
        from: MAIL_USERNAME,
        to: to,
        subject: subject,
        html: html
    };

    logger.info(`Sending mail to - ${to}`);
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log("error ", error);

            logger.error(error);
        } else {
            console.log('Email sent: ' + info.response);

            logger.info('Email sent: ' + info.response);
        }
    });
}