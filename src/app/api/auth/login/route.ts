import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { getDbConnection } from '@/lib/db';

// Define a type for the user row
interface UserRow {
  id: number;
  email: string;
  password: string;
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const db = getDbConnection();

    return new Promise((resolve) => {
      db.get<UserRow>('SELECT * FROM users WHERE email = ?', [email], async (err, row) => {
        if (err) {
          console.error("Database error during login:", err.message);
          resolve(NextResponse.json({ error: 'Database error during login' }, { status: 500 }));
          return;
        }

        if (!row) {
           console.log("Login attempt failed: Email not found - ", email);
          resolve(NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })); // Unauthorized
          return;
        }

        // Compare hashed password
        const match = await bcrypt.compare(password, row.password);

        if (match) {
          console.log(`Login successful for user: ${email}`);
          // In a real app, generate JWT or session token here
          // For now, just send success message and user info (excluding password)
          resolve(NextResponse.json({ message: 'Login successful', user: { id: row.id, email: row.email } }, { status: 200 }));
        } else {
           console.log("Login attempt failed: Incorrect password for - ", email);
          resolve(NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })); // Unauthorized
        }
      });
    });

  } catch (error: unknown) {
    console.error("Login API error:", error);
     const errorMessage = error instanceof Error ? error.message : 'Internal Server Error during login';
     if (error instanceof SyntaxError && error.message.includes('JSON')) {
         return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
     }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
} 