exports.withrawalEmail = (userName, email, totalSavings, upi, amount) => {
  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <title>Money Withrawal Request</title>
    <style>
      body {
        background-color: #ffffff;
        font-family: Arial, sans-serif;
        font-size: 16px;
        line-height: 1.4;
        color: #333333;
        margin: 0;
        padding: 0;
      }

      .container {
        max-width: 600px;
        margin: 0 auto;
        padding: 20px;
        text-align: center;
      }

      .message {
        font-size: 18px;
        font-weight: bold;
        margin-bottom: 20px;
      }

      .body {
        font-size: 16px;
        margin-bottom: 20px;
      }
    </style>
  </head>

  <body>
    <div class="container">
      <div class="message">Money Withrawal Request</div>
      <div class="body">
        <p>Hello sir, I want to withraw some money from my savings,</p>
        <p>Here are the details</p>
        <p>Name: ${userName}</p>
        <p>Email: ${email}</p>
        <p>Total Savings: ${totalSavings}</p>
        <p>UPI ID: ${upi}</p>
        <p>Withrawal amount: ${amount}</p>
      </div>
    </div>
  </body>
</html>
`;
};
