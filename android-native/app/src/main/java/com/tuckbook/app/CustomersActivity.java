package com.tuckbook.app;

import android.app.Activity;
import android.content.Intent;
import android.graphics.Color;
import android.os.Bundle;
import android.view.View;
import android.view.ViewGroup;
import android.widget.AdapterView;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.ListView;
import android.widget.TextView;
import com.tuckbook.app.db.TuckBookDB;
import com.tuckbook.app.db.TuckBookDB.Customer;
import java.util.List;
import java.util.Locale;

public class CustomersActivity extends Activity {

    private TuckBookDB db;
    private ListView lvCustomers;
    private TextView tvSummary;
    private List<Customer> customers;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_customers);
        db = TuckBookDB.getInstance(this);

        tvSummary = (TextView) findViewById(R.id.tvSummary);
        lvCustomers = (ListView) findViewById(R.id.lvCustomers);

        Button btnBack = (Button) findViewById(R.id.btnBack);
        btnBack.setOnClickListener(new View.OnClickListener() {
            @Override public void onClick(View v) { finish(); }
        });

        Button btnAdd = (Button) findViewById(R.id.btnAddCustomer);
        btnAdd.setOnClickListener(new View.OnClickListener() {
            @Override public void onClick(View v) {
                startActivity(new Intent(CustomersActivity.this, AddCustomerActivity.class));
            }
        });

        lvCustomers.setOnItemClickListener(new AdapterView.OnItemClickListener() {
            @Override public void onItemClick(AdapterView<?> p, View v, int pos, long id) {
                Intent intent = new Intent(CustomersActivity.this, CustomerDetailActivity.class);
                intent.putExtra("customerId", customers.get(pos).id);
                startActivity(intent);
            }
        });
    }

    @Override
    protected void onResume() {
        super.onResume();
        loadCustomers();
    }

    private void loadCustomers() {
        customers = db.getAllCustomers();

        double totalOwed = 0;
        int debtorCount = 0;
        for (Customer c : customers) {
            if (c.balance > 0) { totalOwed += c.balance; debtorCount++; }
        }
        tvSummary.setText(debtorCount + " debtors  ·  "
            + String.format(Locale.US, "$%.2f", totalOwed) + " total owed");

        lvCustomers.setAdapter(new ArrayAdapter<Customer>(this,
            R.layout.item_customer, customers) {

            @Override
            public View getView(int position, View convertView, ViewGroup parent) {
                if (convertView == null) {
                    convertView = getLayoutInflater().inflate(R.layout.item_customer, parent, false);
                }
                Customer c = customers.get(position);
                boolean isOwed = c.balance > 0;

                TextView tvAvatar = (TextView) convertView.findViewById(R.id.tvAvatar);
                tvAvatar.setText(getInitials(c.name));
                tvAvatar.setBackgroundColor(getAvatarColor(c.name));

                ((TextView) convertView.findViewById(R.id.tvName)).setText(c.name);

                TextView tvPhone = (TextView) convertView.findViewById(R.id.tvPhone);
                tvPhone.setText(c.phone != null && !c.phone.isEmpty() ? c.phone : "No phone number");

                TextView tvBalance = (TextView) convertView.findViewById(R.id.tvBalance);
                TextView tvLabel = (TextView) convertView.findViewById(R.id.tvBalanceLabel);

                if (isOwed) {
                    tvBalance.setText(String.format(Locale.US, "-$%.2f", c.balance));
                    tvBalance.setTextColor(Color.parseColor("#E53935"));
                    tvLabel.setText("owes you");
                } else {
                    tvBalance.setText("$0.00");
                    tvBalance.setTextColor(Color.parseColor("#00C853"));
                    tvLabel.setText("settled");
                }
                return convertView;
            }
        });
    }

    static String getInitials(String name) {
        if (name == null || name.isEmpty()) return "?";
        String[] parts = name.trim().split("\\s+");
        if (parts.length >= 2) return ("" + parts[0].charAt(0) + parts[1].charAt(0)).toUpperCase();
        return ("" + parts[0].charAt(0)).toUpperCase();
    }

    static int getAvatarColor(String name) {
        int[] colors = {
            Color.parseColor("#E53935"), Color.parseColor("#8E24AA"),
            Color.parseColor("#1E88E5"), Color.parseColor("#00897B"),
            Color.parseColor("#43A047"), Color.parseColor("#F4511E"),
        };
        if (name == null || name.isEmpty()) return colors[0];
        int hash = 0;
        for (char ch : name.toCharArray()) hash = ch + ((hash << 5) - hash);
        return colors[Math.abs(hash) % colors.length];
    }
}
