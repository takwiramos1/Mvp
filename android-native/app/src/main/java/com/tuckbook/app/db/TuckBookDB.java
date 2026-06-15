package com.tuckbook.app.db;

import android.content.ContentValues;
import android.content.Context;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.database.sqlite.SQLiteOpenHelper;
import java.util.ArrayList;
import java.util.List;

public class TuckBookDB extends SQLiteOpenHelper {

    private static final String DB_NAME = "tuckbook.db";
    private static final int DB_VERSION = 1;
    private static TuckBookDB instance;

    public static synchronized TuckBookDB getInstance(Context ctx) {
        if (instance == null) instance = new TuckBookDB(ctx.getApplicationContext());
        return instance;
    }

    private TuckBookDB(Context ctx) {
        super(ctx, DB_NAME, null, DB_VERSION);
    }

    @Override
    public void onCreate(SQLiteDatabase db) {
        db.execSQL("PRAGMA foreign_keys = ON");
        db.execSQL("CREATE TABLE customers (" +
            "id INTEGER PRIMARY KEY AUTOINCREMENT," +
            "name TEXT NOT NULL," +
            "phone TEXT DEFAULT ''," +
            "created_at INTEGER DEFAULT (strftime('%s','now'))" +
        ")");
        db.execSQL("CREATE TABLE transactions (" +
            "id INTEGER PRIMARY KEY AUTOINCREMENT," +
            "customer_id INTEGER NOT NULL," +
            "amount REAL NOT NULL," +
            "type TEXT NOT NULL," +
            "description TEXT DEFAULT ''," +
            "created_at INTEGER DEFAULT (strftime('%s','now'))," +
            "FOREIGN KEY(customer_id) REFERENCES customers(id) ON DELETE CASCADE" +
        ")");
    }

    @Override
    public void onUpgrade(SQLiteDatabase db, int oldV, int newV) {
        db.execSQL("DROP TABLE IF EXISTS transactions");
        db.execSQL("DROP TABLE IF EXISTS customers");
        onCreate(db);
    }

    // ── Customer Operations ────────────────────────────────────────────────────

    public long addCustomer(String name, String phone) {
        ContentValues cv = new ContentValues();
        cv.put("name", name.trim());
        cv.put("phone", phone != null ? phone.trim() : "");
        return getWritableDatabase().insert("customers", null, cv);
    }

    public boolean updateCustomer(long id, String name, String phone) {
        ContentValues cv = new ContentValues();
        cv.put("name", name.trim());
        cv.put("phone", phone != null ? phone.trim() : "");
        return getWritableDatabase().update("customers", cv, "id=?",
            new String[]{String.valueOf(id)}) > 0;
    }

    public void deleteCustomer(long id) {
        getWritableDatabase().delete("customers", "id=?", new String[]{String.valueOf(id)});
    }

    public List<Customer> getAllCustomers() {
        List<Customer> list = new ArrayList<>();
        Cursor c = getReadableDatabase().rawQuery(
            "SELECT c.id, c.name, c.phone, c.created_at," +
            " COALESCE(SUM(CASE WHEN t.type='credit' THEN t.amount ELSE 0 END)" +
            "  - SUM(CASE WHEN t.type='payment' THEN t.amount ELSE 0 END), 0) AS balance" +
            " FROM customers c LEFT JOIN transactions t ON t.customer_id=c.id" +
            " GROUP BY c.id ORDER BY balance DESC, c.name ASC", null);
        while (c.moveToNext()) {
            list.add(cursorToCustomer(c));
        }
        c.close();
        return list;
    }

    public Customer getCustomer(long id) {
        Cursor c = getReadableDatabase().rawQuery(
            "SELECT c.id, c.name, c.phone, c.created_at," +
            " COALESCE(SUM(CASE WHEN t.type='credit' THEN t.amount ELSE 0 END)" +
            "  - SUM(CASE WHEN t.type='payment' THEN t.amount ELSE 0 END), 0) AS balance" +
            " FROM customers c LEFT JOIN transactions t ON t.customer_id=c.id" +
            " WHERE c.id=? GROUP BY c.id", new String[]{String.valueOf(id)});
        Customer cust = c.moveToFirst() ? cursorToCustomer(c) : null;
        c.close();
        return cust;
    }

    private Customer cursorToCustomer(Cursor c) {
        Customer cust = new Customer();
        cust.id = c.getLong(0);
        cust.name = c.getString(1);
        cust.phone = c.getString(2);
        cust.createdAt = c.getLong(3);
        cust.balance = c.getDouble(4);
        return cust;
    }

    // ── Transaction Operations ─────────────────────────────────────────────────

    public long addTransaction(long customerId, double amount, String type, String description) {
        ContentValues cv = new ContentValues();
        cv.put("customer_id", customerId);
        cv.put("amount", Math.abs(amount));
        cv.put("type", type);
        cv.put("description", description != null ? description.trim() : "");
        return getWritableDatabase().insert("transactions", null, cv);
    }

    public void deleteTransaction(long id) {
        getWritableDatabase().delete("transactions", "id=?", new String[]{String.valueOf(id)});
    }

    public List<Transaction> getTransactions(long customerId) {
        List<Transaction> list = new ArrayList<>();
        Cursor c = getReadableDatabase().query("transactions", null, "customer_id=?",
            new String[]{String.valueOf(customerId)}, null, null, "created_at DESC");
        while (c.moveToNext()) {
            Transaction t = new Transaction();
            t.id = c.getLong(c.getColumnIndex("id"));
            t.customerId = c.getLong(c.getColumnIndex("customer_id"));
            t.amount = c.getDouble(c.getColumnIndex("amount"));
            t.type = c.getString(c.getColumnIndex("type"));
            t.description = c.getString(c.getColumnIndex("description"));
            t.createdAt = c.getLong(c.getColumnIndex("created_at"));
            list.add(t);
        }
        c.close();
        return list;
    }

    public List<Transaction> getRecentTransactions(int limit) {
        List<Transaction> list = new ArrayList<>();
        Cursor c = getReadableDatabase().rawQuery(
            "SELECT t.*, c.name AS customer_name FROM transactions t" +
            " JOIN customers c ON c.id=t.customer_id" +
            " ORDER BY t.created_at DESC LIMIT ?", new String[]{String.valueOf(limit)});
        while (c.moveToNext()) {
            Transaction t = new Transaction();
            t.id = c.getLong(c.getColumnIndex("id"));
            t.customerId = c.getLong(c.getColumnIndex("customer_id"));
            t.amount = c.getDouble(c.getColumnIndex("amount"));
            t.type = c.getString(c.getColumnIndex("type"));
            t.description = c.getString(c.getColumnIndex("description"));
            t.createdAt = c.getLong(c.getColumnIndex("created_at"));
            t.customerName = c.getString(c.getColumnIndex("customer_name"));
            list.add(t);
        }
        c.close();
        return list;
    }

    // ── Dashboard Stats ────────────────────────────────────────────────────────

    public DashboardStats getStats() {
        DashboardStats s = new DashboardStats();
        long todayStart = System.currentTimeMillis() / 1000L;
        // Go back to midnight
        java.util.Calendar cal = java.util.Calendar.getInstance();
        cal.set(java.util.Calendar.HOUR_OF_DAY, 0);
        cal.set(java.util.Calendar.MINUTE, 0);
        cal.set(java.util.Calendar.SECOND, 0);
        todayStart = cal.getTimeInMillis() / 1000L;

        Cursor c = getReadableDatabase().rawQuery(
            "SELECT COALESCE(SUM(CASE WHEN type='credit' THEN amount ELSE 0 END),0)," +
            "       COALESCE(SUM(CASE WHEN type='payment' THEN amount ELSE 0 END),0)" +
            " FROM transactions", null);
        if (c.moveToFirst()) {
            s.totalOwed = Math.max(0, c.getDouble(0) - c.getDouble(1));
        }
        c.close();

        c = getReadableDatabase().rawQuery(
            "SELECT COALESCE(SUM(CASE WHEN type='credit' THEN amount ELSE 0 END),0)," +
            "       COALESCE(SUM(CASE WHEN type='payment' THEN amount ELSE 0 END),0)" +
            " FROM transactions WHERE created_at >= ?", new String[]{String.valueOf(todayStart)});
        if (c.moveToFirst()) {
            s.todayCredit = c.getDouble(0);
            s.todayPayments = c.getDouble(1);
        }
        c.close();

        c = getReadableDatabase().rawQuery(
            "SELECT COUNT(*) FROM (" +
            " SELECT customer_id, SUM(CASE WHEN type='credit' THEN amount ELSE -amount END) AS b" +
            " FROM transactions GROUP BY customer_id HAVING b > 0)", null);
        if (c.moveToFirst()) s.activeDebtors = c.getInt(0);
        c.close();

        return s;
    }

    // ── Model Classes ──────────────────────────────────────────────────────────

    public static class Customer {
        public long id;
        public String name;
        public String phone;
        public long createdAt;
        public double balance;
    }

    public static class Transaction {
        public long id;
        public long customerId;
        public double amount;
        public String type;
        public String description;
        public long createdAt;
        public String customerName;
    }

    public static class DashboardStats {
        public double totalOwed;
        public double todayCredit;
        public double todayPayments;
        public int activeDebtors;
    }
}
