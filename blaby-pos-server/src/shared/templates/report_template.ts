import moment from "moment";

export function generateReportTemplate(props: any): string {
  try {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Sales Report</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            margin: 40px;
            color: #333;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #eee;
        }
        .summary-box {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 30px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .summary-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
            margin-bottom: 20px;
        }
        .summary-item {
            text-align: center;
            padding: 15px;
            background: white;
            border-radius: 6px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .summary-item h3 {
            margin: 0;
            color: #666;
            font-size: 14px;
        }
        .summary-item p {
            margin: 10px 0 0;
            font-size: 20px;
            font-weight: bold;
            color: #2c3e50;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
            background: white;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        th, td {
            padding: 12px 15px;
            text-align: left;
            border-bottom: 1px solid #eee;
        }
        th {
            background: #f8f9fa;
            font-weight: bold;
            color: #2c3e50;
        }
        tr:hover {
            background: #f8f9fa;
        }
        .category-badge {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            background: #e9ecef;
            font-size: 12px;
            color: #495057;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Sales Performance Report</h1>
        <p>Generated on February 12, 2025</p>
    </div>

    <div class="summary-box">
        <h2>Summary Overview</h2>
        <div class="summary-grid">
            <div class="summary-item">
                <h3>Total Products</h3>
                <p>20</p>
            </div>
            <div class="summary-item">
                <h3>Overall Revenue</h3>
                <p>₹4,740</p>
            </div>
            <div class="summary-item">
                <h3>Total Billed Items</h3>
                <p>53</p>
            </div>
            <div class="summary-item">
                <h3>Pending Orders</h3>
                <p>20</p>
            </div>
            <div class="summary-item">
                <h3>Cancelled Items</h3>
                <p>23</p>
            </div>
            <div class="summary-item">
                <h3>Average Item Price</h3>
                <p>₹54.50</p>
            </div>
        </div>
    </div>

    <h2>Product Details</h2>
    <table>
        <thead>
            <tr>
                <th>Product Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Billed</th>
                <th>Pending</th>
                <th>Cancelled</th>
                <th>Total Revenue</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>Spanish Black</td>
                <td><span class="category-badge">Juice</span></td>
                <td>₹100</td>
                <td>7</td>
                <td>1</td>
                <td>1</td>
                <td>₹800</td>
            </tr>
            <tr>
                <td>Apple Shake</td>
                <td><span class="category-badge">Apple</span></td>
                <td>₹70</td>
                <td>11</td>
                <td>1</td>
                <td>4</td>
                <td>₹840</td>
            </tr>
            <tr>
                <td>Cold Coffee</td>
                <td><span class="category-badge">Coffee</span></td>
                <td>₹20</td>
                <td>3</td>
                <td>1</td>
                <td>3</td>
                <td>₹80</td>
            </tr>
        </tbody>
    </table>

    <div style="margin-top: 40px; text-align: right; color: #666;">
        <p>End of Report</p>
    </div>
</body>
</html>`;
  } catch (error) {
    console.error("Error generating invoice template:", error);
    throw new Error("Failed to generate invoice template.");
  }
}