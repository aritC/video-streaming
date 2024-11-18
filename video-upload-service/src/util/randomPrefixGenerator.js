const randomPrefixGenerator = () => {
    return (Math.random() + 1).toString(36).substring(2,8);
}

module.exports = {randomPrefixGenerator};