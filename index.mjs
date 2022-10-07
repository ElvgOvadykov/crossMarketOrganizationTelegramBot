import axios from "axios";
import TelegramBot from "node-telegram-bot-api";
import * as dotenv from "dotenv";
import { UserStatusEnum } from "./enums.mjs";

dotenv.config();

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

const botStatusMap = new Map();

const signUpFormData = new Map();

bot.on("message", async (message) => {
  const chatId = message.chat.id;
  const text = message.text;
  const telegramId = message.from.id;
  console.log("telegramId", telegramId);

  if (text === "/start") {
    axios
      .get(`http://localhost:5000/api/organization/${telegramId}`)
      .then((response) => {
        console.log(response);
        botStatusMap.set(chatId, UserStatusEnum.UserIsAuthorized);
      })
      .catch(async (result) => {
        console.log(result);

        if (result.response.status === 404) {
          botStatusMap.set(chatId, UserStatusEnum.SignUpNameTyping);

          await bot.sendMessage(
            chatId,
            "Мы не нашли ваш аккаунт в списке организаций. Для работы с данным ботом вам необходимо зарегистрироваться как организация, для этого последовательно ответьте на ряд вопросов. Введите название вашей организации."
          );
        }
      });
  } else {
    const status = botStatusMap.get(chatId);

    switch (status) {
      case UserStatusEnum.SignUpNameTyping:
        signUpFormData.set(telegramId, { name: text });

        botStatusMap.set(chatId, UserStatusEnum.SignUpPhoneTyping);

        await bot.sendMessage(chatId, "Введите номер телефона.");
        break;

      case UserStatusEnum.SignUpPhoneTyping: {
        const formData = signUpFormData.get(telegramId);

        signUpFormData.set(
          telegramId,
          Object.assign(formData, { phone: text })
        );

        botStatusMap.set(chatId, UserStatusEnum.SignUpFounderNameTyping);

        await bot.sendMessage(chatId, "Введите ФИО учредителя.");
        break;
      }

      case UserStatusEnum.SignUpFounderNameTyping: {
        const formData = signUpFormData.get(telegramId);

        signUpFormData.set(
          telegramId,
          Object.assign(formData, { founderName: text })
        );

        botStatusMap.set(chatId, UserStatusEnum.SignUpRequestSend);

        axios
          .post(
            "http://localhost:5000/api/telegram/organization-request-sign-up",
            {
              telegramId,
              ...signUpFormData.get(telegramId),
            }
          )
          .then(async () => {
            await bot.sendMessage(
              chatId,
              "Запрос на регистрацию был отправлен"
            );
          })
          .catch(async (error) => {
            await bot.sendMessage(
              chatId,
              `Возникла ошибка при отправке запроса на регистрацию: ${error}`
            );
          });

        break;
      }
    }
  }
});
