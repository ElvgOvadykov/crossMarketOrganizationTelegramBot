const UserStatusEnum = {
  /** Статус не определен */
  Undefined: 0,
  /** Статус ввода названия организации */
  SignUpNameTyping: 1,
  /** Статус ввода телефона */
  SignUpPhoneTyping: 2,
  /** Статус ввода имени учредителя */
  SignUpFounderNameTyping: 3,
  /** Статус запроса на регистрацию отправлен */
  SignUpRequestSend: 4,
  /** Пользователь авторизован в сервисе */
  UserIsAuthorized: 5,
};

export { UserStatusEnum };
