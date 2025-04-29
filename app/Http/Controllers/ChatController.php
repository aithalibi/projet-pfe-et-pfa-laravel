<?php

namespace App\Http\Controllers;

use App\Models\ChatMessage;
use App\Models\Professor;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ChatController extends Controller
{
    public function getMessages(Request $request, $professorId, $studentId)
    {
        $messages = ChatMessage::where(function($query) use ($professorId, $studentId) {
            $query->where('professor_id', $professorId)
                  ->where('student_id', $studentId);
        })->orderBy('created_at', 'asc')->get();

        return response()->json($messages);
    }

    public function sendMessage(Request $request)
    {
        $request->validate([
            'professor_id' => 'required|exists:professors,id',
            'student_id' => 'required|exists:students,id',
            'message' => 'required|string',
            'sender_type' => 'required|in:professor,student'
        ]);

        $message = ChatMessage::create([
            'professor_id' => $request->professor_id,
            'student_id' => $request->student_id,
            'message' => $request->message,
            'sender_type' => $request->sender_type,
            'is_read' => false
        ]);

        return response()->json($message, 201);
    }

    public function markAsRead(Request $request, $messageId)
    {
        $message = ChatMessage::findOrFail($messageId);
        $message->update(['is_read' => true]);
        return response()->json(['message' => 'Message marqué comme lu']);
    }

    public function getUnreadCount(Request $request, $professorId)
    {
        $count = ChatMessage::where('professor_id', $professorId)
            ->where('sender_type', 'student')
            ->where('is_read', false)
            ->count();

        return response()->json(['unread_count' => $count]);
    }
} 