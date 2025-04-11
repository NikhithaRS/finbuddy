import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { getDbConnection } from '@/lib/db';

const saltRounds = 10; // Cost factor for bcrypt

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // Basic email validation (consider a library like zod for more robust validation)
    if (!/\S+@\S+\.\S+/.test(email)) {
       return NextResponse.json({ error: 'Invalid email format' }, { status: 400 });
    }
    
    if (password.length < 6) { // Basic password length check
         return NextResponse.json({ error: 'Password must be at least 6 characters long' }, { status: 400 });
    }

    const db = getDbConnection();
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    return new Promise((resolve) => {
      db.run('INSERT INTO users (email, password) VALUES (?, ?)', 
        [email, hashedPassword], 
        function (err) { // Use standard function for 'this' context if needed
          if (err) {
            if (err.message.includes('UNIQUE constraint failed')) {
              console.error("Signup Error: Email already exists - ", email);
              resolve(NextResponse.json({ error: 'Email already exists' }, { status: 409 })); // Conflict
            } else {
              console.error("Database error during signup:", err.message);
              resolve(NextResponse.json({ error: 'Database error during signup' }, { status: 500 }));
            }
          } else {
            console.log(`User created with ID: ${this.lastID}, email: ${email}`);
            // In a real app, you might generate a session token here
            resolve(NextResponse.json({ message: 'User created successfully', userId: this.lastID }, { status: 201 }));
          }
      });
    });

  } catch (error: unknown) {
    console.error("Signup API error:", error);
    const errorMessage = error instanceof Error ? error.message : 'Internal Server Error during signup';
    if (error instanceof SyntaxError && error.message.includes('JSON')) {
        return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
  // Note: Closing DB connection here might be too early if app is continuously running
  // Consider managing connection lifecycle elsewhere or keeping it open
} 