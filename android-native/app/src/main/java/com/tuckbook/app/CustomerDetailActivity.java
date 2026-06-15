package com.tuckbook.app;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.DialogInterface;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.os.Bundle;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.ListView;
import android.widget.TextView;
import android.widget.Toast;
import com.tuckbook.app.db.TuckBookDB;
import com.tuckbook.app.db.TuckBookDB.Customer;
import com.tuckbook.app.db.TuckBookDB.Transaction;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;
import java.util.Locale;

public class CustomerDetailActivity extends Activity {

    private TuckBookDB db;
    private long customerId;
    private Customer customer;
    private List<Transaction> transactions;
    private ListView lvTransactions;
    private TextView tvAvatar, tvName, tvPhone, tvBalance, tvBalanceLabel, tvToolbarTitle;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_customer_detail);
        db = TuckBookDB.getInstance(this);
        customerId = getIntent().getLongExtra("customerId", -1);

        tvAvatar = (TextView) findViewById(R.id.tvAvatar);
        tvName = (TextView) findViewById(R.id.tvName);
        tvPhone = (TextView) findViewById(R.id.tvPhone);
        tvBalance = (TextView) findViewById(R.id.tvBalance);
        tvBalanceLabel = (TextView) findViewById(R.id.tvBalanceLabel);
        tvToolbarTitle = (TextView) findViewById(R.id.tvToolbarTitle);
        lvTransactions = (ListView) findViewById(R.id.lvTransactions);

        ((Button) findViewById(R.id.btnBack)).setOnClickListener(new View.OnClickListener() {
            @Override public void onClick(View v) { finish(); }
        });

        ((Button) findViewById(R.id.btnDelete)).setOnClickListener(new View.OnClickListener() {
            @Override public void onClick(View v) { confirmDelete(); }
        });

        ((Button) findViewById(R.id.btnWhatsApp)).setOnClickListener(new View.OnClickListener() {
            @Override public void onClick(View v) { sendWhatsApp(); }
        });

        ((Button) findViewById(R.id.btnSMS)).setOnClickListener(new View.OnClickListener() {
            @Override public void onClick(View v) { sendSMS(); }
        });

        ((Button) findViewById(R.id.btnCall)).setOnClickListener(new View.OnClickListener() {
            @Override public void onClick(View v) { callCustomer(); }
        });

        ((Button) findViewById(R.id.btnGiveCredit)).setOnClickListener(new View.OnClickListener() {
            @Override public void onClick(View v) {
                Intent i = new Intent(CustomerDetailActivity.this, AddTransactionActivity.class);
                i.putExtra("customerId", customerId);
                i.putExtra("customerName", customer != null ? customer.name : "");
                i.putExtra("type", "credit");
                startActivity(i);
            }
        });

        ((Button) findViewById(R.id.btnGotPaid)).setOnClickListener(new View.OnClickListener() {
            @Override public void onClick(View v) {
                Intent i = new Intent(CustomerDetailActivity.this, AddTransactionActivity.class);
                i.putExtra("customerId", customerId);
                i.putExtra("customerName", customer != null ? customer.name : "");
                i.putExtra("type", "payment");
                startActivity(i);
            }
        });
    }

    @Override
    protected void onResume() {
        super.onResume();
        loadData();
    }

    private void loadData() {
        customer = db.getCustomer(customerId);
        if (customer == null) { finish(); return; }

        tvToolbarTitle.setText(customer.name);
        tvName.setText(customer.name);
        tvPhone.setText(customer.phone != null && !customer.phone.isEmpty()
            ? customer.phone : "No phone number");
        tvAvatar.setText(CustomersActivity.getInitials(customer.name));
        tvAvatar.setBackgroundColor(CustomersActivity.getAvatarColor(customer.name));

        boolean isOwed = customer.balance > 0;
        tvBalance.setText(String.format(Locale.US, "$%.2f", Math.abs(customer.balance)));
        tvBalance.setTextColor(isOwed ? Color.parseColor("#E53935") : Color.parseColor("#00C853"));
        tvBalanceLabel.setText(isOwed ? "OWES YOU" : "ALL SETTLED");
        tvBalanceLabel.setTextColor(isOwed ? Color.parseColor("#E53935") : Color.parseColor("#00C853"));

        transactions = db.getTransactions(customerId);
        lvTransactions.setAdapter(new ArrayAdapter<Transaction>(this,
            R.layout.item_transaction, transactions) {

            @Override
            public View getView(int pos, View convertView, ViewGroup parent) {
                if (convertView == null) {
                    convertView = getLayoutInflater().inflate(R.layout.item_transaction, parent, false);
                }
                Transaction t = transactions.get(pos);
                boolean isCredit = "credit".equals(t.type);

                View dot = convertView.findViewById(R.id.dotColor);
                dot.setBackgroundColor(isCredit ? Color.parseColor("#E53935") : Color.parseColor("#00C853"));

                String desc = (t.description != null && !t.description.isEmpty())
                    ? t.description : (isCredit ? "Goods on credit" : "Payment received");
                ((TextView) convertView.findViewById(R.id.tvDescription)).setText(desc);
                ((TextView) convertView.findViewById(R.id.tvDate)).setText(
                    new SimpleDateFormat("MMM d, h:mm a", Locale.US).format(new Date(t.createdAt * 1000L)));

                TextView tvAmt = (TextView) convertView.findViewById(R.id.tvAmount);
                tvAmt.setText((isCredit ? "-" : "+") + String.format(Locale.US, "$%.2f", t.amount));
                tvAmt.setTextColor(isCredit ? Color.parseColor("#E53935") : Color.parseColor("#00C853"));
                ((TextView) convertView.findViewById(R.id.tvType)).setText(isCredit ? "CREDIT" : "PAYMENT");

                return convertView;
            }
        });
    }

    private void sendWhatsApp() {
        if (customer == null) return;
        if (customer.balance <= 0) {
            Toast.makeText(this, customer.name + " has no outstanding balance", Toast.LENGTH_SHORT).show();
            return;
        }
        String msg = "Hi " + customer.name + ", this is a friendly reminder.\n\n"
            + "Your outstanding balance is: $" + String.format(Locale.US, "%.2f", customer.balance)
            + "\n\nPlease come in to settle your account when you can. Thank you! 🙏";

        String phone = formatPhone(customer.phone);
        String url = phone != null
            ? "https://wa.me/" + phone + "?text=" + Uri.encode(msg)
            : "whatsapp://send?text=" + Uri.encode(msg);

        try {
            startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse(url)));
        } catch (Exception e) {
            Toast.makeText(this, "WhatsApp not found. Is it installed?", Toast.LENGTH_LONG).show();
        }
    }

    private void sendSMS() {
        if (customer == null || customer.phone == null || customer.phone.isEmpty()) {
            Toast.makeText(this, "No phone number saved for this customer", Toast.LENGTH_SHORT).show();
            return;
        }
        String msg = "Hi " + customer.name + ", your outstanding balance is $"
            + String.format(Locale.US, "%.2f", customer.balance)
            + ". Please come to settle. Thank you.";
        Intent intent = new Intent(Intent.ACTION_SENDTO, Uri.parse("smsto:" + customer.phone));
        intent.putExtra("sms_body", msg);
        try { startActivity(intent); }
        catch (Exception e) { Toast.makeText(this, "SMS not available", Toast.LENGTH_SHORT).show(); }
    }

    private void callCustomer() {
        if (customer == null || customer.phone == null || customer.phone.isEmpty()) {
            Toast.makeText(this, "No phone number saved for this customer", Toast.LENGTH_SHORT).show();
            return;
        }
        try {
            startActivity(new Intent(Intent.ACTION_DIAL, Uri.parse("tel:" + customer.phone)));
        } catch (Exception e) {
            Toast.makeText(this, "Cannot make call", Toast.LENGTH_SHORT).show();
        }
    }

    private void confirmDelete() {
        new AlertDialog.Builder(this)
            .setTitle("Delete Customer")
            .setMessage("Delete " + (customer != null ? customer.name : "this customer")
                + " and all their transactions? This cannot be undone.")
            .setPositiveButton("Delete", new DialogInterface.OnClickListener() {
                @Override public void onClick(DialogInterface d, int w) {
                    db.deleteCustomer(customerId);
                    finish();
                }
            })
            .setNegativeButton("Cancel", null)
            .show();
    }

    private static String formatPhone(String phone) {
        if (phone == null || phone.isEmpty()) return null;
        String cleaned = phone.replaceAll("[^\\d+]", "");
        if (cleaned.startsWith("0") && cleaned.length() >= 10) return "263" + cleaned.substring(1);
        return cleaned.replaceAll("^\\+", "");
    }
}
