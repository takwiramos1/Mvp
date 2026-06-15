package com.tuckbook.app;

import android.app.Activity;
import android.content.Intent;
import android.graphics.Color;
import android.os.Bundle;
import android.text.TextUtils;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;
import android.widget.Toast;
import com.tuckbook.app.db.TuckBookDB;
import java.util.ArrayList;
import java.util.List;

public class AddTransactionActivity extends Activity {

    private TuckBookDB db;
    private long customerId = -1;
    private String type = "credit";
    private EditText etAmount, etDescription;
    private Button btnSave;
    private TextView tvTitle, tvCustomerName;

    // Pre-filled items
    private static final String[] QUICK_ITEMS = {
        "Bread", "Sugar", "Cooking Oil", "Mealie Meal", "Airtime",
        "Data Bundle", "Soap", "Rice", "Salt", "Flour"
    };

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_add_transaction);
        db = TuckBookDB.getInstance(this);

        Intent intent = getIntent();
        customerId = intent.getLongExtra("customerId", -1);
        type = intent.getStringExtra("type");
        if (type == null) type = "credit";
        String customerName = intent.getStringExtra("customerName");

        tvTitle = (TextView) findViewById(R.id.tvTitle);
        tvCustomerName = (TextView) findViewById(R.id.tvCustomerName);
        etAmount = (EditText) findViewById(R.id.etAmount);
        etDescription = (EditText) findViewById(R.id.etDescription);
        btnSave = (Button) findViewById(R.id.btnSave);

        boolean isCredit = "credit".equals(type);
        tvTitle.setText(isCredit ? "Give Credit" : "Got Payment");
        btnSave.setText(isCredit ? "Record Credit" : "Record Payment");
        btnSave.setBackgroundColor(isCredit ? Color.parseColor("#E53935") : Color.parseColor("#00C853"));

        if (customerId == -1) {
            // No customer preset — pick from customers list
            List<TuckBookDB.Customer> customers = db.getAllCustomers();
            if (customers.isEmpty()) {
                Toast.makeText(this, "Add a customer first", Toast.LENGTH_LONG).show();
                startActivity(new Intent(this, AddCustomerActivity.class));
                finish();
                return;
            }
            // Use first customer or show picker (simplified: use first for MVP)
            // A full implementation would show a dialog picker
            showCustomerPicker(customers);
        } else {
            tvCustomerName.setText(customerName != null ? customerName : "Customer #" + customerId);
        }

        ((Button) findViewById(R.id.btnCancel)).setOnClickListener(new View.OnClickListener() {
            @Override public void onClick(View v) { finish(); }
        });

        btnSave.setOnClickListener(new View.OnClickListener() {
            @Override public void onClick(View v) { save(); }
        });

        etAmount.requestFocus();
    }

    private void showCustomerPicker(final List<TuckBookDB.Customer> customers) {
        String[] names = new String[customers.size()];
        for (int i = 0; i < customers.size(); i++) names[i] = customers.get(i).name;

        new android.app.AlertDialog.Builder(this)
            .setTitle("Select Customer")
            .setItems(names, new android.content.DialogInterface.OnClickListener() {
                @Override public void onClick(android.content.DialogInterface d, int which) {
                    TuckBookDB.Customer c = customers.get(which);
                    customerId = c.id;
                    tvCustomerName.setText(c.name);
                }
            })
            .setNegativeButton("Cancel", new android.content.DialogInterface.OnClickListener() {
                @Override public void onClick(android.content.DialogInterface d, int w) { finish(); }
            })
            .setCancelable(false)
            .show();
    }

    private void save() {
        if (customerId == -1) {
            Toast.makeText(this, "Please select a customer", Toast.LENGTH_SHORT).show();
            return;
        }
        String amtStr = etAmount.getText().toString().trim();
        if (TextUtils.isEmpty(amtStr)) {
            Toast.makeText(this, "Please enter an amount", Toast.LENGTH_SHORT).show();
            etAmount.requestFocus();
            return;
        }
        double amount;
        try {
            amount = Double.parseDouble(amtStr);
        } catch (NumberFormatException e) {
            Toast.makeText(this, "Invalid amount", Toast.LENGTH_SHORT).show();
            return;
        }
        if (amount <= 0) {
            Toast.makeText(this, "Amount must be greater than 0", Toast.LENGTH_SHORT).show();
            return;
        }

        String desc = etDescription.getText().toString().trim();
        long id = db.addTransaction(customerId, amount, type, desc);

        if (id > 0) {
            Toast.makeText(this,
                ("credit".equals(type) ? "Credit recorded" : "Payment recorded") + " ✓",
                Toast.LENGTH_SHORT).show();
            finish();
        } else {
            Toast.makeText(this, "Error saving. Try again.", Toast.LENGTH_SHORT).show();
        }
    }
}
