
export const validateUsername = (username: string) => {
    // at least 6 characters, only a-zA-Z0-9 and .
    const regex = /^[a-zA-Z0-9.]{6,}$/;
    return regex.test(username);
};

export const validateFullName = (name: string) => {
    // 2-50 characters, a-zA-Z0-9, space, and Vietnamese characters
    const regex = /^[a-zA-Z0-9\sA-ZÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚĂĐĨŨƠàáâãèéêìíòóôõùúăđĩũơƯĂÂÊÔƠƯÀẢÃẠẰẮẲẴẶẦẤẨẪẬÈẺẼẸỀẾỂỄỆÌỈĨỊÒỎÕỌỒỐỔỖỘỜỚỞỠỢÙỦŨỤỪỨỬỮỰỲỶỸỴ]{2,50}$/i;
    return regex.test(name);
};

export const validatePassword = (password: string) => {
    // at least 8 characters, 1 upper, 1 lower, 1 number, 1 special character
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(password);
};

export const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
};
