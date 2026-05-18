<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UserController extends Controller
{
    // 🔹 Tampilkan semua user
    public function index()
    {
        return Inertia::render('Admin/Users', [
            'users' => User::select('id', 'name', 'email', 'role')->get()
        ]);
    }

    // 🔹 Update role user
    public function updateRole($id)
    {
        $user = User::findOrFail($id);

        // ❌ Jangan ubah diri sendiri (biar aman)
        if ($user->id === auth()->id()) {
            return back()->with('error', 'Tidak bisa mengubah role sendiri');
        }

        // 🔁 Toggle role
        $user->role = $user->role === 'admin' ? 'user' : 'admin';
        $user->save();

        return back()->with('success', 'Role berhasil diubah');
    }

    // 🔹 Hapus user (optional)
    public function destroy($id)
    {
        $user = User::findOrFail($id);

        if ($user->id === auth()->id()) {
            return back()->with('error', 'Tidak bisa menghapus diri sendiri');
        }

        $user->delete();

        return back()->with('success', 'User berhasil dihapus');
    }
}