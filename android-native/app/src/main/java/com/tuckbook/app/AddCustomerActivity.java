package com.tuckbook.app;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.text.TextUtils;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Toast;
import com.tuckbook.app.db.TuckBookDB;

public class AddCustomerActivity extends Activity {

    private TuckBookDB db;
    private EditText etName, etPhone;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_add_customer);
        db = TuckBookDB.getInstance(this);

        etName = (EditText) findViewById(R.id.etName);
        etPhone = (EditText) findViewById(R.id.etPhone);

        View.OnClickListener saveListener = new View.OnClickListener() {
            @Override public void onClick(View v) { save(); }
        };

        ((Button) findViewById(R.id.btnSave)).setOnClickListener(saveListener);
        ((Button) findViewById(R.id.btnSaveBottom)).setOnClickListener(saveListener);

        ((Button) findViewById(R.id.btnCancel)).setOnClickListener(new View.OnClickListener() {
            @Override public void onClick(View v) { finish(); }
        });

        etName.requestFocus();
    }

    private void save() {
        String name = etName.getText().toString().trim();
        if (TextUtils.isEmpty(name)) {
            Toast.makeText(this, "Please enter the customer name", Toast.LENGTH_SHORT).show();
            etName.requestFocus();
            return;
        }
        String phone = etPhone.getText().toString().trim();
        long id = db.addCustomer(name, phone);
        if (id > 0) {
            Intent intent = new Intent(this, CustomerDetailActivity.class);
            intent.putExtra("customerId", id);
            intent.setFlags(Intent.FLAG_ACTIVITY_CLEAR_TOP);
            startActivity(intent);
            finish();
        } else {
            Toast.makeText(this, "Error saving customer. Please try again.", Toast.LENGTH_SHORT).show();
        }
    }
}
