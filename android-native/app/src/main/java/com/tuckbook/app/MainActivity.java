package com.tuckbook.app;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.AdapterView;
import android.widget.ArrayAdapter;
import android.widget.Button;
import android.widget.ListView;
import android.widget.TextView;
import com.tuckbook.app.db.TuckBookDB;
import com.tuckbook.app.db.TuckBookDB.DashboardStats;
import com.tuckbook.app.db.TuckBookDB.Transaction;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;
import java.util.Locale;

public class MainActivity extends Activity {

    private TuckBookDB db;
    private TextView tvTotalOwed, tvDebtorCount, tvTodayCredit, tvTodayPayments;
    private ListView lvRecent;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        db = TuckBookDB.getInstance(this);

        tvTotalOwed = (TextView) findViewById(R.id.tvTotalOwed);
        tvDebtorCount = (TextView) findViewById(R.id.tvDebtorCount);
        tvTodayCredit = (TextView) findViewById(R.id.tvTodayCredit);
        tvTodayPayments = (TextView) findViewById(R.id.tvTodayPayments);
        lvRecent = (ListView) findViewById(R.id.lvRecentTransactions);

        Button btnCustomers = (Button) findViewById(R.id.btnCustomers);
        btnCustomers.setOnClickListener(new View.OnClickListener() {
            @Override public void onClick(View v) {
                startActivity(new Intent(MainActivity.this, CustomersActivity.class));
            }
        });

        Button btnGiveCredit = (Button) findViewById(R.id.btnGiveCredit);
        btnGiveCredit.setOnClickListener(new View.OnClickListener() {
            @Override public void onClick(View v) {
                Intent i = new Intent(MainActivity.this, AddTransactionActivity.class);
                i.putExtra("type", "credit");
                startActivity(i);
            }
        });

        Button btnPayment = (Button) findViewById(R.id.btnRecordPayment);
        btnPayment.setOnClickListener(new View.OnClickListener() {
            @Override public void onClick(View v) {
                Intent i = new Intent(MainActivity.this, AddTransactionActivity.class);
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
        DashboardStats s = db.getStats();
        tvTotalOwed.setText(formatMoney(s.totalOwed));
        tvDebtorCount.setText(s.activeDebtors + " customer" + (s.activeDebtors != 1 ? "s" : "") + " owe you");
        tvTodayCredit.setText(formatMoney(s.todayCredit));
        tvTodayPayments.setText(formatMoney(s.todayPayments));

        final List<Transaction> txs = db.getRecentTransactions(10);
        String[] items = new String[txs.size()];
        for (int i = 0; i < txs.size(); i++) {
            Transaction t = txs.get(i);
            String sign = "credit".equals(t.type) ? "-" : "+";
            String desc = (t.description != null && !t.description.isEmpty())
                ? t.description : ("credit".equals(t.type) ? "Credit" : "Payment");
            items[i] = t.customerName + "  |  " + desc + "  " + sign + formatMoney(t.amount)
                + "  (" + formatDate(t.createdAt) + ")";
        }
        lvRecent.setAdapter(new ArrayAdapter<>(this,
            android.R.layout.simple_list_item_1, items));

        lvRecent.setOnItemClickListener(new AdapterView.OnItemClickListener() {
            @Override public void onItemClick(AdapterView<?> p, View v, int pos, long id) {
                Transaction t = txs.get(pos);
                Intent intent = new Intent(MainActivity.this, CustomerDetailActivity.class);
                intent.putExtra("customerId", t.customerId);
                startActivity(intent);
            }
        });
    }

    static String formatMoney(double v) {
        return String.format(Locale.US, "$%.2f", v);
    }

    static String formatDate(long unixSecs) {
        return new SimpleDateFormat("MMM d", Locale.US).format(new Date(unixSecs * 1000L));
    }
}
